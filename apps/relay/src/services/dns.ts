import { resolve4, resolve6, resolveMx } from "node:dns/promises";
import type { CacheEntry, RelayTarget } from "../types";

// DNS lookup utilities for performance optimization
export abstract class DNSLookupService {
	private static cache = new Map<
		string,
		CacheEntry<RelayTarget[] | string[]>
	>();
	private static readonly TTL = 300000; // 5 minutes cache

	/**
	 * Get MX records for a domain with caching
	 */
	static async getMxRecords(domain: string): Promise<RelayTarget[]> {
		const cacheKey = `mx:${domain}`;
		const cached = DNSLookupService.cache.get(cacheKey);

		if (cached && cached.expires > Date.now()) {
			return cached.data as RelayTarget[];
		}

		try {
			const mxRecords = await resolveMx(domain);
			const targets: RelayTarget[] = [];

			// Sort by priority (lower number = higher priority)
			mxRecords.sort((a, b) => a.priority - b.priority);

			for (const mx of mxRecords) {
				const target: RelayTarget = {
					domain,
					priority: mx.priority,
					host: mx.exchange,
				};

				// Resolve IP addresses in parallel for speed
				try {
					const [ipv4, ipv6] = await Promise.allSettled([
						resolve4(mx.exchange),
						resolve6(mx.exchange),
					]);

					if (ipv4.status === "fulfilled") target.ipv4 = ipv4.value;
					if (ipv6.status === "fulfilled") target.ipv6 = ipv6.value;
				} catch (e) {
					// Continue even if IP resolution fails
					console.warn(`Failed to resolve IPs for ${mx.exchange}:`, e);
				}

				targets.push(target);
			}

			// Cache the result
			DNSLookupService.cache.set(cacheKey, {
				data: targets,
				expires: Date.now() + DNSLookupService.TTL,
			});

			return targets;
		} catch (error) {
			throw new Error(`Failed to resolve MX records for ${domain}: ${error}`);
		}
	}

	/**
	 * Get A records for a hostname with caching
	 */
	static async getARecords(hostname: string): Promise<string[]> {
		const cacheKey = `a:${hostname}`;
		const cached = DNSLookupService.cache.get(cacheKey);

		if (cached && cached.expires > Date.now()) {
			return cached.data as string[];
		}

		try {
			const ips = await resolve4(hostname);
			DNSLookupService.cache.set(cacheKey, {
				data: ips,
				expires: Date.now() + DNSLookupService.TTL,
			});
			return ips;
		} catch (error) {
			throw new Error(`Failed to resolve A records for ${hostname}: ${error}`);
		}
	}

	/**
	 * Clear expired cache entries periodically
	 */
	static cleanCache(): void {
		const now = Date.now();
		for (const [key, value] of DNSLookupService.cache.entries()) {
			if (value.expires <= now) {
				DNSLookupService.cache.delete(key);
			}
		}
	}

	/**
	 * Get cache statistics
	 */
	static getCacheStats(): { size: number; entries: number } {
		return {
			size: DNSLookupService.cache.size,
			entries: DNSLookupService.cache.size,
		};
	}

	/**
	 * Clear all cache entries
	 */
	static clearCache(): void {
		DNSLookupService.cache.clear();
	}
}
