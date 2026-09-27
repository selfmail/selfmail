import { Config } from "effect";

export const AppConfig = Config.all({
  REDIS_URL: Config.NonEmptyString("REDIS_URL").pipe(
    Config.withDefault("redis://localhost:6379")
  ),
});
