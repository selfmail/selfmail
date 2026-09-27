import { Context, Effect } from "effect";
import IORedis from "ioredis";
import { AppConfig } from "./config";

export class Redis extends Context.Service<Redis>()(
  "@selfmail/recipient/redis",
  {
    make: Effect.gen(function* () {
      const config = yield* AppConfig;

      return new IORedis(config.redis);
    }),
  }
) {}
