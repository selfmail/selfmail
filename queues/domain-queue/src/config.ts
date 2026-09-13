import { Config } from "effect";

export const AppConfig = Config.all({
  databaseUrl: Config.NonEmptyString("DATABASE_URL").pipe(
    Config.withDefault("postgresql://postgres:postgres@localhost:5432/postgres")
  ),
  redisUrl: Config.NonEmptyString("REDIS_URL").pipe(
    Config.withDefault("redis://localhost:6379")
  ),
  domainQueueName: Config.NonEmptyString("DOMAIN_QUEUE_NAME").pipe(
    Config.withDefault("domain-queue")
  ),
  domainQueueConcurrency: Config.Int("DOMAIN_QUEUE_CONCURRENCY").pipe(
    Config.withDefault(5)
  ),
  mailServerUrl: Config.NonEmptyString("MAIL_SERVER_URL").pipe(
    Config.withDefault("mail.selfmail.app")
  ),
});
