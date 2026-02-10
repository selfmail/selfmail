import { RedisClient } from "bun";

const redis = new RedisClient(
  process.env.REDIS_URL || "redis://localhost:6379"
);

try {
  await redis.sadd("mailbox:selfmail.app", "henri");

  await redis.sadd("wildcard:selfmail.app", "support-*", "info-*");

  await redis.set("catchall:selfmail.app", "1");
} catch (error) {
  console.error("Error setting example data:", error);
}
