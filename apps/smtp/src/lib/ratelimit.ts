import Redis from "ioredis";

export interface RateLimitOptions {
	max: number;
	windowInSeconds: number;
}

export interface RateLimitResult {
	success: boolean;
	remaining: number;
	resetIn: number;
}

export class Ratelimit {
	private static redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

	private static defaultOptions: RateLimitOptions = {
		max: 100,
		windowInSeconds: 60,
	};

	static async limit(
		id: string,
		options?: Partial<RateLimitOptions>,
	): Promise<RateLimitResult> {
		const redis = Ratelimit.redis;
		const opts = { ...Ratelimit.defaultOptions, ...options };
		const key = `ratelimit:${id}`;
		const now = Math.floor(Date.now() / 1000);

		// Check if key exists
		const data = await redis.get(key);

		if (!data) {
			// First request, initialize counter
			const newData = {
				count: 1,
				startTime: now,
			};

			await redis.set(key, JSON.stringify(newData));
			await redis.expire(key, opts.windowInSeconds);

			return {
				success: true,
				remaining: opts.max - 1,
				resetIn: opts.windowInSeconds,
			};
		}

		// Parse existing data
		const parsedData = JSON.parse(data as string);
		const elapsedTime = now - parsedData.startTime;
		const timeRemaining = opts.windowInSeconds - elapsedTime;

		// Check if we're still within the time window
		if (elapsedTime < opts.windowInSeconds) {
			// Increment counter
			parsedData.count += 1;

			// Check if we've exceeded the limit
			if (parsedData.count > opts.max) {
				await redis.set(key, JSON.stringify(parsedData));
				await redis.expire(key, timeRemaining > 0 ? timeRemaining : 1);

				return {
					success: false,
					remaining: 0,
					resetIn: timeRemaining > 0 ? timeRemaining : 1,
				};
			}

			// Update the data
			await redis.set(key, JSON.stringify(parsedData));
			await redis.expire(key, timeRemaining > 0 ? timeRemaining : 1);

			return {
				success: true,
				remaining: opts.max - parsedData.count,
				resetIn: timeRemaining > 0 ? timeRemaining : 1,
			};
		}

		// Time window has passed, reset counter
		const newData = {
			count: 1,
			startTime: now,
		};

		await redis.set(key, JSON.stringify(newData));
		await redis.expire(key, opts.windowInSeconds);

		return {
			success: true,
			remaining: opts.max - 1,
			resetIn: opts.windowInSeconds,
		};
	}

	/**
	 * Resets the rate limit for a specific ID
	 * @param id Unique identifier for the rate limit
	 */
	static async reset(id: string): Promise<void> {
		const key = `ratelimit:${id}`;
		await Ratelimit.redis.del(key);
	}

	/**
	 * Get current rate limit status without incrementing the counter
	 * @param id Unique identifier for the rate limit
	 * @param options Rate limit options
	 */
	static async getStatus(
		id: string,
		options?: Partial<RateLimitOptions>,
	): Promise<RateLimitResult> {
		const redis = Ratelimit.redis;
		const opts = { ...Ratelimit.defaultOptions, ...options };
		const key = `ratelimit:${id}`;
		const now = Math.floor(Date.now() / 1000);

		const data = await redis.get(key);

		if (!data) {
			return {
				success: true,
				remaining: opts.max,
				resetIn: opts.windowInSeconds,
			};
		}

		const parsedData = JSON.parse(data as string);
		const elapsedTime = now - parsedData.startTime;
		const timeRemaining = opts.windowInSeconds - elapsedTime;

		if (elapsedTime < opts.windowInSeconds) {
			return {
				success: parsedData.count < opts.max,
				remaining: Math.max(0, opts.max - parsedData.count),
				resetIn: timeRemaining > 0 ? timeRemaining : 1,
			};
		}

		return {
			success: true,
			remaining: opts.max,
			resetIn: opts.windowInSeconds,
		};
	}
}
