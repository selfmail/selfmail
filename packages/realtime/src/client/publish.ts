import { Data, Effect, Schema } from "effect";
import {
  type EventChannel,
  type EventPayload,
  RealtimeEvents,
} from "../events";
import { Redis } from "../redis/connection";

export class InvalidRealtimeEventError extends Data.TaggedError(
  "InvalidRealtimeEventError"
)<{
  channel: EventChannel;
  cause: unknown;
}> {}

export class PublishError extends Data.TaggedError("PublishRedisError")<{
  channel: EventChannel;
  cause: unknown;
}> {}

export const publish = Effect.fn("realtime.publish")(function* <
  C extends EventChannel,
>(channel: C, payload: EventPayload<C>) {
  const schema = RealtimeEvents[channel];

  const parsedPayload = yield* Schema.decodeUnknownEffect(schema)(payload).pipe(
    Effect.mapError(
      (cause) =>
        new InvalidRealtimeEventError({
          channel,
          cause,
        })
    )
  );

  const redis = yield* Redis;

  yield* Effect.tryPromise({
    try: () => redis.publish(channel, JSON.stringify(parsedPayload)),

    catch: (cause) =>
      new PublishError({
        channel,
        cause,
      }),
  });
});
