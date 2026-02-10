import { RedisClient } from "bun";

const redis = new RedisClient(
  process.env.REDIS_URL || "redis://localhost:6379"
);

try {
  await redis.del("mailbox:selfmail.app");
  await redis.del("wildcard:selfmail.app");
  await redis.del("catchall:selfmail.app");
} catch (error) {
  console.error("Error removing example data:", error);
}
