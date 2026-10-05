import { describe, expect, test } from "bun:test";
import { EventEmitter } from "node:events";
import { Effect } from "effect";
import type IORedis from "ioredis";
import { publish } from "../src/client/publish";
import { subscribe } from "../src/client/subscribe";
import { Redis, SubscribeRedis } from "../src/redis/connection";

class FakeRedis extends EventEmitter {
  subscriptions: string[] = [];
  unsubscriptions: string[] = [];
  publications: [string, string][] = [];
  subscribeGate: Promise<void> | undefined;
  failSubscribe = false;
  failPublish = false;
  failUnsubscribe = false;
  duplicate() {
    return this;
  }
  async subscribe(channel: string) {
    this.subscriptions.push(channel);
    await this.subscribeGate;
    if (this.failSubscribe) {
      throw new Error("subscribe failed");
    }
    return 1;
  }
  unsubscribe(channel: string) {
    this.unsubscriptions.push(channel);
    if (this.failUnsubscribe) {
      return Promise.reject(new Error("unsubscribe failed"));
    }
    return Promise.resolve(0);
  }
  publish(channel: string, message: string) {
    if (this.failPublish) {
      return Promise.reject(new Error("publish failed"));
    }
    this.publications.push([channel, message]);
    return Promise.resolve(1);
  }
  get client() {
    return this as unknown as IORedis;
  }
}
const payload = { mailId: "mail-1", mailboxId: "box-1" };
const tick = () => new Promise((resolve) => setTimeout(resolve, 10));
const listen = (
  redis: FakeRedis,
  handler: (value: typeof payload) => Effect.Effect<void>
) =>
  Effect.runPromise(
    subscribe("mail.received", handler).pipe(
      Effect.provideService(SubscribeRedis, redis.client)
    )
  );

describe("realtime", () => {
  test("publisher and subscriber have distinct service keys", () => {
    expect(Redis.key).not.toBe(SubscribeRedis.key);
  });
  test("publishes validated payload and rejects invalid data", async () => {
    const redis = new FakeRedis();
    await Effect.runPromise(
      publish("mail.received", payload).pipe(
        Effect.provideService(Redis, redis.client)
      )
    );
    expect(redis.publications).toEqual([
      ["mail.received", JSON.stringify(payload)],
    ]);
    const result = await Effect.runPromise(
      publish("mail.received", {
        ...payload,
        mailId: 42,
      } as unknown as typeof payload).pipe(
        Effect.provideService(Redis, redis.client),
        Effect.result
      )
    );
    expect(result._tag).toBe("Failure");
    expect(redis.publications).toHaveLength(1);
    redis.failPublish = true;
    expect(
      await Effect.runPromise(
        publish("mail.received", payload).pipe(
          Effect.provideService(Redis, redis.client),
          Effect.result
        )
      )
    ).toMatchObject({
      _tag: "Failure",
      failure: { _tag: "PublishRedisError" },
    });
  });
  test("isolates clients and contains malformed messages", async () => {
    const first = new FakeRedis();
    const second = new FakeRedis();
    const received: unknown[] = [];
    const cleanup = await listen(first, (value) =>
      Effect.sync(() => {
        received.push(value);
      })
    );
    const cleanupSecond = await listen(second, () => Effect.void);
    expect(second.subscriptions).toEqual(["mail.received"]);
    expect(() =>
      first.emit("message", "mail.received", "{invalid")
    ).not.toThrow();
    first.emit("message", "mail.received", JSON.stringify({ mailId: 1 }));
    first.emit("message", "unknown", "{}");
    first.emit("message", "mail.received", JSON.stringify(payload));
    await tick();
    expect(received).toEqual([payload]);
    await Effect.runPromise(cleanup);
    await Effect.runPromise(cleanupSecond);
    expect(first.listenerCount("message")).toBe(0);
  });
  test("retries failed subscriptions", async () => {
    const redis = new FakeRedis();
    redis.failSubscribe = true;
    expect(listen(redis, () => Effect.void)).rejects.toThrow();
    redis.failSubscribe = false;
    const cleanup = await listen(redis, () => Effect.void);
    expect(redis.subscriptions).toHaveLength(2);
    await Effect.runPromise(cleanup);
  });
  test("same callback has independent registrations and cleanup is idempotent", async () => {
    const redis = new FakeRedis();
    const handler = () => Effect.void;
    const [first, second] = await Promise.all([
      listen(redis, handler),
      listen(redis, handler),
    ]);
    expect(redis.subscriptions).toHaveLength(1);
    await Effect.runPromise(first);
    await Effect.runPromise(first);
    expect(redis.unsubscriptions).toHaveLength(0);
    await Effect.runPromise(second);
    expect(redis.unsubscriptions).toHaveLength(1);
  });
  test("failed unsubscribe can be retried", async () => {
    const redis = new FakeRedis();
    const cleanup = await listen(redis, () => Effect.void);
    redis.failUnsubscribe = true;
    expect(Effect.runPromise(cleanup)).rejects.toThrow();
    redis.failUnsubscribe = false;
    await Effect.runPromise(cleanup);
    expect(redis.unsubscriptions).toHaveLength(2);
  });
  test("concurrent callers both observe subscription failures and can retry", async () => {
    const redis = new FakeRedis();
    let release: () => void = () => {
      throw new Error("gate not initialized");
    };
    redis.subscribeGate = new Promise<void>((resolve) => {
      release = resolve;
    });
    redis.failSubscribe = true;
    const results = Promise.allSettled([
      listen(redis, () => Effect.void),
      listen(redis, () => Effect.void),
    ]);
    release();
    expect((await results).map((result) => result.status)).toEqual([
      "rejected",
      "rejected",
    ]);
    expect(redis.listenerCount("message")).toBe(0);
    redis.failSubscribe = false;
    const cleanup = await listen(redis, () => Effect.void);
    await Effect.runPromise(cleanup);
  });
  test("a throwing handler does not prevent other handlers from receiving events", async () => {
    const redis = new FakeRedis();
    const received: unknown[] = [];
    const bad = await listen(redis, () => {
      throw new Error("handler failed");
    });
    const good = await listen(redis, (value) =>
      Effect.sync(() => {
        received.push(value);
      })
    );
    redis.emit("message", "mail.received", JSON.stringify(payload));
    await tick();
    expect(received).toEqual([payload]);
    await Effect.runPromise(bad);
    await Effect.runPromise(good);
  });
});
