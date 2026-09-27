# @selfmail/realtime

Validated Redis Pub/Sub events for server-side consumers (for example, SSE).
Set `REDIS_URL`; it defaults to `redis://localhost:6379`.

## Usage

```ts
import { publish, Redis, subscribe, SubscribeRedis } from "@selfmail/realtime";
import { Effect } from "effect";

await Effect.runPromise(
  publish("mail.received", { mailId: "mail-1", mailboxId: "box-1" }).pipe(
    Effect.provide(Redis.layer)
  )
);

const consumer = Effect.gen(function* () {
  yield* Effect.acquireRelease(
    subscribe("mail.received", (payload) => Effect.log(payload.mailId)),
    (cleanup) => cleanup.pipe(Effect.catchCause(Effect.logError))
  );
  yield* Effect.never;
}).pipe(Effect.scoped, Effect.provide(SubscribeRedis.layer));

const fiber = Effect.runFork(consumer);
// Interrupt this fiber when the consumer disconnects to release its subscription.
```

Reuse layers for long-lived applications. Publisher and subscriber services use
separate connections; each layer disconnects its connection when its scope ends.
Keep the subscriber layer alive for the full subscription lifetime.

`subscribe` returns a cleanup Effect: run it, or register it as a scope finalizer.
Registrations share one Redis subscription per channel and client. Cleanup is
idempotent; a failed unsubscribe can be retried. Subscription operations are
serialized and finish before interruption, so configure Redis command timeouts
if bounded shutdown latency is required. Injected clients are owned by the caller
and must be dedicated to this package's subscriptions.

Supported channels:

- `mail.received`, `mail.updated`, `notification`: `{ mailId, mailboxId }` strings.
- `domain.verified`: `{ domainId }` string.

Publishing validates payloads before sending. Malformed incoming messages and
handler failures are logged; one handler's failure does not stop other handlers.
Events already being processed may finish after cleanup. Redis Pub/Sub has no
replay or persistence; handlers may overlap across messages. Channels are global,
so consumers must apply authorization/filtering before forwarding to users.

## Verification

From the repository root:

```sh
bun test packages/realtime/tests
bunx tsc --noEmit -p packages/realtime/tsconfig.json
bunx ultracite check packages/realtime
```

Tests use isolated Redis doubles; they do not require a running Redis server.
