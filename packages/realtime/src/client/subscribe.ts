import { Data, Effect, Schema, Semaphore } from "effect";
import type IORedis from "ioredis";
import {
  type EventChannel,
  type EventPayload,
  RealtimeEvents,
} from "../events";
import { SubscribeRedis } from "../redis/connection";

export class InvalidRealtimeEventError extends Data.TaggedError(
  "InvalidRealtimeEventError"
)<{ channel: EventChannel; cause: unknown }> {}

export class SubscribeError extends Data.TaggedError("SubscribeRedisError")<{
  channel: EventChannel;
  cause: unknown;
}> {}

type Handler<C extends EventChannel> = (
  payload: EventPayload<C>
) => Effect.Effect<void>;
type AnyHandler = (payload: unknown) => Effect.Effect<void>;

interface SubscriberState {
  handlers: Map<EventChannel, Set<AnyHandler>>;
  lock: Semaphore.Semaphore;
  listener: (channel: string, message: string) => void;
}
const subscribers = new WeakMap<IORedis, SubscriberState>();
const logFailure = (cause: unknown) =>
  Effect.logError("Realtime event handling failed", cause);

function getState(redis: IORedis): SubscriberState {
  const existing = subscribers.get(redis);
  if (existing) {
    return existing;
  }
  const handlers = new Map<EventChannel, Set<AnyHandler>>();
  const state: SubscriberState = {
    handlers,
    lock: Semaphore.makeUnsafe(1),
    listener(incomingChannel, message) {
      const channel = incomingChannel as EventChannel;
      const registered = handlers.get(channel);
      if (!registered?.size) {
        return;
      }
      const snapshot = [...registered];
      Effect.runFork(
        Effect.try({
          try: () => JSON.parse(message) as unknown,
          catch: (cause) => new InvalidRealtimeEventError({ channel, cause }),
        }).pipe(
          Effect.flatMap(Schema.decodeUnknownEffect(RealtimeEvents[channel])),
          Effect.flatMap((payload) =>
            Effect.forEach(
              snapshot,
              (handler) =>
                Effect.suspend(() => handler(payload)).pipe(
                  Effect.catchCause(logFailure)
                ),
              { concurrency: "unbounded", discard: true }
            )
          ),
          Effect.catchCause(logFailure)
        )
      );
    },
  };
  subscribers.set(redis, state);
  return state;
}

export const subscribe = Effect.fn("realtime.subscribe")(function* <
  C extends EventChannel,
>(channel: C, handler: Handler<C>) {
  const redis = yield* SubscribeRedis;
  const state = getState(redis);
  // Each registration needs its own identity, even when callbacks are shared.
  const registered: AnyHandler = (payload) =>
    handler(payload as EventPayload<C>);
  const command = (operation: () => Promise<unknown>) =>
    Effect.tryPromise({
      try: operation,
      catch: (cause) => new SubscribeError({ channel, cause }),
    });
  yield* state.lock
    .withPermit(
      Effect.gen(function* () {
        let handlers = state.handlers.get(channel);
        if (handlers) {
          handlers.add(registered);
        } else {
          if (state.handlers.size === 0) {
            redis.on("message", state.listener);
          }
          handlers = new Set<AnyHandler>();
          state.handlers.set(channel, handlers);
          handlers.add(registered);
          yield* command(() => redis.subscribe(channel)).pipe(
            Effect.tapError(() =>
              Effect.sync(() => {
                state.handlers.delete(channel);
                if (state.handlers.size === 0) {
                  redis.off("message", state.listener);
                }
              })
            )
          );
        }
      })
    )
    .pipe(Effect.uninterruptible);

  return state.lock
    .withPermit(
      Effect.gen(function* () {
        const handlers = state.handlers.get(channel);
        if (!handlers?.has(registered)) {
          return;
        }
        if (handlers.size === 1) {
          yield* command(() => redis.unsubscribe(channel));
          state.handlers.delete(channel);
          if (state.handlers.size === 0) {
            redis.off("message", state.listener);
          }
        }
        handlers.delete(registered);
      })
    )
    .pipe(Effect.uninterruptible);
});
