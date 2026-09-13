import { Config } from "effect";

export const AppConfig = Config.all({
  aiHostUrl: Config.NonEmptyString().pipe(
    Config.withDefault("https://api.openai.com")
  ),
  clamavHost: Config.NonEmptyString("CLAMAV_HOST").pipe(
    Config.withDefault("127.0.0.1")
  ),
  clamavPort: Config.Port("CLAMAV_PORT").pipe(Config.withDefault(3310)),
  clamavTimeout: Config.Int("CLAMAV_TIMEOUT").pipe(Config.withDefault(300_000)),
  redisUrl: Config.NonEmptyString("REDIS_URL").pipe(
    Config.withDefault("redis://localhost:6379")
  ),
  spamQueueName: Config.NonEmptyString("SPAM_QUEUE_NAME").pipe(
    Config.withDefault("spam")
  ),
  spamQueueConcurrency: Config.Int("SPAM_QUEUE_CONCURRENCY").pipe(
    Config.withDefault(5)
  ),
});
