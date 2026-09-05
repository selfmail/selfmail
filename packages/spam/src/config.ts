import { Config } from "effect";

export const AppConfig = Config.all({
  aiHostUrl: Config.nonEmptyString().pipe(
    Config.withDefault("https://api.openai.com")
  ),
  clamavHost: Config.nonEmptyString("CLAMAV_HOST").pipe(
    Config.withDefault("127.0.0.1")
  ),
  clamavPort: Config.port("CLAMAV_PORT").pipe(Config.withDefault(3310)),
  clamavTimeout: Config.int("CLAMAV_TIMEOUT").pipe(Config.withDefault(300_000)),
  redisUrl: Config.nonEmptyString("REDIS_URL").pipe(
    Config.withDefault("redis://localhost:6379")
  ),
  spamQueueName: Config.nonEmptyString("SPAM_QUEUE_NAME").pipe(
    Config.withDefault("spam")
  ),
  spamQueueConcurrency: Config.int("SPAM_QUEUE_CONCURRENCY").pipe(
    Config.withDefault(5)
  ),
});
