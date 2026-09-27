import { Config } from "effect";

export const AppConfig = Config.all({
  redis: Config.NonEmptyString().pipe(
    Config.withDefault("redis://localhost:6379")
  ),
});
