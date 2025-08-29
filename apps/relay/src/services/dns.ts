import { resolveMx } from "node:dns/promises";
import { Logs } from "services/logs";

export abstract class DNS {
	static async resolveMX(
		domain: string,
	): Promise<{ exchange: string; priority: number }[]> {
		const record = await resolveMx(domain);

		Logs.log(`Found: ${JSON.stringify(record)} for ${domain}`);
		return record;
	}
}
