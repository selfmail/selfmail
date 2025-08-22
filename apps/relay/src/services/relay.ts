import type { EmailData, RelayResult, RelayTarget } from "../types";
import { DNSLookupService } from "./dns";

export abstract class EmailRelayService {
	static async processEmail(emailData: EmailData): Promise<RelayResult> {
		const allTargets: RelayTarget[] = [];
		const errors: string[] = [];

		const domains = new Set(
			emailData.to
				.map((email) => email.split("@")[1])
				.filter((domain): domain is string => Boolean(domain)),
		);

		const domainPromises = Array.from(domains).map(async (domain) => {
			try {
				const targets = await DNSLookupService.getMxRecords(domain);
				return { domain, targets, error: null };
			} catch (error) {
				const errorMessage = `Failed to resolve ${domain}: ${error}`;
				return { domain, targets: [], error: errorMessage };
			}
		});

		const results = await Promise.allSettled(domainPromises);

		for (const result of results) {
			if (result.status === "fulfilled") {
				const { targets, error } = result.value;
				if (error) {
					errors.push(error);
				} else {
					allTargets.push(...targets);
				}
			} else {
				errors.push(`Failed to process domain: ${result.reason}`);
			}
		}

		if (allTargets.length === 0) {
			return {
				success: false,
				relayTargets: [],
				message: `No valid relay targets found. Errors: ${errors.join(", ")}`,
			};
		}

		allTargets.sort((a, b) => a.priority - b.priority);

		return {
			success: true,
			relayTargets: allTargets,
			message: `Found ${allTargets.length} relay targets for ${domains.size} domains${errors.length > 0 ? `. Warnings: ${errors.join(", ")}` : ""}`,
		};
	}

	static getStats(): {
		cacheStats: ReturnType<typeof DNSLookupService.getCacheStats>;
		uptime: number;
		memory: NodeJS.MemoryUsage;
	} {
		return {
			cacheStats: DNSLookupService.getCacheStats(),
			uptime: process.uptime(),
			memory: process.memoryUsage(),
		};
	}
}
