// Subscribe to Redis events and forward them e.g. through WebSockets / SSE
import { Data, Effect, Layer, Schema } from "effect";
import type IORedis from "ioredis";
import {
  type EventChannel,
  type EventPayload,
  RealtimeEvents,
} from "../events";
import { SubscribeRedis } from "../redis/connection";

export class InvalidRealtimeEventError extends Data.TaggedError(
  "InvalidRealtimeEventError"
)<{
  channel: EventChannel;
  cause: unknown;
}> {}

export class SubscribeError extends Data.TaggedError("SubscribeRedisError")<{
  channel: EventChannel;
  cause: unknown;
}> {}

type Handler<C extends EventChannel> = (
  payload: EventPayload<C>
) => Effect.Effect<void>;

type AnyHandler = (payload: unknown) => Effect.Effect<void>;

const handlers = new Map<EventChannel, Set<AnyHandler>>();

let subscriber: IORedis | undefined;
let listenerInitialized = false;

export const subscribe = Effect.fn("realtime.subscribe")(function* <
  C extends EventChannel,
>(channel: C, handler: Handler<C>) {
  const redis = yield* SubscribeRedis;

  // ioredis needs a dedicated connection for SUBSCRIBE
  if (!subscriber) {
    subscriber = redis.duplicate();
  }

  // Only create ONE global Redis "message" listener
  if (!listenerInitialized) {
    subscriber.on("message", (incomingChannel, message) => {
      const channel = incomingChannel as EventChannel;

      const channelHandlers = handlers.get(channel);

      if (!channelHandlers || channelHandlers.size === 0) {
        return;
      }

      const schema = RealtimeEvents[channel];

      Effect.runPromise(
        Schema.decodeUnknownEffect(schema)(JSON.parse(message)).pipe(
          Effect.mapError(
            (cause) =>
              new InvalidRealtimeEventError({
                channel,
                cause,
              })
          ),
          Effect.flatMap((payload) =>
            Effect.forEach(channelHandlers, (handler) => handler(payload), {
              concurrency: "unbounded",
              discard: true,
            })
          ),
          Effect.catchCause((cause) =>
            Effect.logError("Realtime event handling failed", cause)
          )
        )
      );
    });

    listenerInitialized = true;
  }

  let channelHandlers = handlers.get(channel);

  // First local listener for this channel:
  // actually subscribe Redis to it
  if (!channelHandlers) {
    channelHandlers = new Set();

    handlers.set(channel, channelHandlers);

    yield* Effect.tryPromise({
      try: async () => await subscriber?.subscribe(channel),

      catch: (cause) =>
        new SubscribeError({
          channel,
          cause,
        }),
    });
  }

  // TS cannot keep the generic C through the Map,
  // so the cast is intentionally hidden here.
  channelHandlers.add(handler as AnyHandler);

  // Return cleanup Effect
  return Effect.gen(function* () {
    const currentHandlers = handlers.get(channel);

    if (!currentHandlers) {
      return;
    }

    currentHandlers.delete(handler as AnyHandler);

    // Nobody on this server listens anymore
    if (currentHandlers.size === 0) {
      handlers.delete(channel);

      yield* Effect.tryPromise({
        try: async () => await subscriber?.unsubscribe(channel),

        catch: (cause) =>
          new SubscribeError({
            channel,
            cause,
          }),
      });
    }
  }).pipe(Layer.provide(SubscribeRedis));
});
