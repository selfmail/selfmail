import type { MxRecord } from "node:dns";
import IORedis from "ioredis";

export abstract class Cache {
	private static redis = new IORedis(
		process.env.REDIS_URL || "redis://localhost:6379",
	);

	static async get(
		key: string,
	): Promise<{ expires: number; records: MxRecord[] } | null> {
		const data = await Cache.redis.get(key);
		if (!data) return null;

		const { expires, records } = JSON.parse(data);
		return { expires, records };
	}

	static async set(
		key: string,
		value: { records: MxRecord[]; expires: number },
		ttl?: number,
	): Promise<void> {
		const expires = ttl ? Date.now() + ttl : Date.now() + 3600 * 1000;
		await Cache.redis.set(
			`relay-dns-cache:${key}`,
			JSON.stringify({ expires, records: JSON.stringify(value) }),
		);
	}

	static async delete(key: string): Promise<void> {
		await Cache.redis.del(`relay-dns-cache:${key}`);
	}
}
