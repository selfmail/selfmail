import { resolveMx } from "node:dns/promises";
import { Logs } from "services/logs";
import { Cache } from "./cache";

export abstract class DNS {
	static async resolveMX(
		domain: string,
	): Promise<{ exchange: string; priority: number }[]> {
		const now = Date.now();
		const entry = await Cache.get(domain);

		if (entry && entry.expires > now) {
			// domain in cache found, return records
			Logs.log(`Used ${domain} from cache!`);
			return entry.records;
		}

		// domain not found in records, creating new cache record
		const records = await resolveMx(domain);
		const ttl = 3600 * 1000; // default fallback
		Cache.set(domain, { records, expires: now + ttl });

		Logs.log(`Found: ${JSON.stringify(records)} for ${domain}`);
		return records;
	}
}
