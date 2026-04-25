import IORedis, { type Redis } from "ioredis";

export interface RateLimitOptions {
  limit?: number;
  windowSeconds?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetIn: number;
  resetAt: Date;
}

export class RateLimiter {
  private readonly redis: Redis;
  private readonly project: string;
  private readonly defaultLimit: number;
  private readonly defaultWindowSeconds: number;

  constructor(project: string) {
    if (!project.trim()) {
      throw new Error("Project identifier is required");
    }

    const redisUrl = process.env.REDIS_URL;
    this.redis = redisUrl ? new IORedis(redisUrl) : new IORedis();
    this.project = project;
    this.defaultLimit = 100;
    this.defaultWindowSeconds = 60;
  }

  async limit(
    identifier: string,
    options: RateLimitOptions = {}
  ): Promise<RateLimitResult> {
    const limit = options.limit ?? this.defaultLimit;
    const windowSeconds = options.windowSeconds ?? this.defaultWindowSeconds;
    const key = this.key(identifier);
    const count = await this.redis.incr(key);

    if (count === 1) {
      await this.redis.expire(key, windowSeconds);
    }

    const resetIn = await this.resetIn(key, windowSeconds);

    return {
      allowed: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      resetIn,
      resetAt: new Date(Date.now() + resetIn * 1000),
    };
  }

  async reset(identifier: string): Promise<void> {
    await this.redis.del(this.key(identifier));
  }

  close(): void {
    this.redis.disconnect();
  }

  private key(identifier: string) {
    return `ratelimit:${this.project}:${identifier}`;
  }

  private async resetIn(key: string, fallback: number) {
    const ttl = await this.redis.ttl(key);
    return ttl > 0 ? ttl : fallback;
  }
}

export { RateLimiter as Ratelimit };
