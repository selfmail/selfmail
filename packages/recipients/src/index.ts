import { RedisClient } from "bun";
import { db } from "database";

export abstract class Recipients {
  static redis = new RedisClient(
    process.env.REDIS_URL || "redis://localhost:6379"
  );
  static async check(email: string) {
    const exists = await Recipients.redis.exists(`recipient:${email}`);

    if (!exists) {
      // Second checking in database to be sure that no one exists
      const recipient = await db.address.findUnique({
        where: { email },
      });

      if (!recipient) {
        return false;
      }
    }

    return true;
  }
}
