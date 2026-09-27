import { Context, Effect, Layer } from "effect";
import IORedis from "ioredis";
import { AppConfig } from "../config";

export class Redis extends Context.Service<Redis>()(
  "@selfmail/realtime/redis",
  {
    make: Effect.gen(function* () {
      const config = yield* AppConfig;

      return new IORedis(config.REDIS_URL);
    }),
  }
) {
  static readonly layer = Layer.effect(this, this.make);
}

export class SubscribeRedis extends Context.Service<Redis>()(
  "@selfmail/realtime/redis",
  {
    make: Effect.gen(function* () {
      const config = yield* AppConfig;

      return new IORedis(config.REDIS_URL);
    }),
  }
) {
  static readonly layer = Layer.effect(this, this.make);
}
