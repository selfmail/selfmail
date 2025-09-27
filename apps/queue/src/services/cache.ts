import type { MxRecord } from "node:dns";
import { connection } from "../config/connection";

export abstract class Cache {
	static async get(
		key: string,
	): Promise<{ expires: number; records: MxRecord[] } | null> {
		const data = await connection.get(key);
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
		await connection.set(
			`relay-dns-cache:${key}`,
			JSON.stringify({ expires, records: JSON.stringify(value) }),
		);
	}

	static async delete(key: string): Promise<void> {
		await connection.del(`relay-dns-cache:${key}`);
	}
}
