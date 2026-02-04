import { RedisClient } from "bun";

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

interface RateLimiterOptions {
  url?: string;
  limit?: number;
  windowSeconds?: number;
  keyPrefix?: string;
}

export class RateLimitRedisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitRedisError";
  }
}

export class Ratelimit {
  private readonly client: RedisClient;
  private readonly limit: number;
  private readonly windowSeconds: number;
  private readonly keyPrefix: string;

  constructor(options: RateLimiterOptions = {}) {
    // if (!(options.url && process.env.REDIS_URL)) {
    //   throw new RateLimitRedisError("Redis URL is required for RateLimiter");
    // }
    this.client = new RedisClient(options.url || "redis://localhost:6379");
    this.limit = options.limit ?? 100;
    this.windowSeconds = options.windowSeconds ?? 3600;
    this.keyPrefix = options.keyPrefix ?? "ratelimit";
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.keyPrefix}:${identifier}`;

    const count = await this.client.incr(key);

    if (count === 1) {
      await this.client.expire(key, this.windowSeconds);
    }

    const ttl = await this.client.ttl(key);
    const resetAt = new Date(Date.now() + ttl * 1000);

    return {
      allowed: count <= this.limit,
      limit: this.limit,
      remaining: Math.max(0, this.limit - count),
      resetAt,
    };
  }

  async reset(identifier: string): Promise<void> {
    const key = `${this.keyPrefix}:${identifier}`;
    await this.client.del(key);
  }

  close(): void {
    this.client.close();
  }
}
