import type { MxRecord } from "node:dns";
import { RedisClient } from "bun";
import { status } from "elysia";

export abstract class Cache {
	private static redis = new RedisClient("redis://localhost:6379");

	static async get(
		key: string,
	): Promise<{ expires: number; records: MxRecord[] } | null> {
		if (!Cache.redis.connected) return null;

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
		if (!Cache.redis.connected) throw status(500, "Internal Server Error");

		const expires = ttl ? Date.now() + ttl : Date.now() + 3600 * 1000;
		await Cache.redis.set(
			`relay-dns-cache:${key}`,
			JSON.stringify({ expires, records: JSON.stringify(value) }),
		);
	}

	static async delete(key: string): Promise<void> {
		if (!Cache.redis.connected) throw status(500, "Internal Server Error");

		await Cache.redis.del(`relay-dns-cache:${key}`);
	}
}
