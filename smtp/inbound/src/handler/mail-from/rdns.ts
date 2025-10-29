import * as dns from "node:dns/promises";
import type { ReverseDNSResult } from "../../types/session";

/**
 * Perform reverse DNS lookup to verify the client IP matches the hostname
 */
export async function performReverseDNSCheck(
	ip: string,
	_reportedHostname: string,
): Promise<ReverseDNSResult> {
	try {
		// Skip rDNS for localhost and private IPs
		if (
			ip === "127.0.0.1" ||
			ip === "::1" ||
			ip.startsWith("192.168.") ||
			ip.startsWith("10.") ||
			/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
		) {
			return { valid: true, reason: "Private/local IP - skipped rDNS" };
		}

		// Perform reverse DNS lookup
		const hostnames = await dns.reverse(ip);

		if (!hostnames || hostnames.length === 0) {
			return {
				valid: false,
				reason: "No PTR record found for IP",
			};
		}

		const resolvedHostname = hostnames[0];

		// Verify forward DNS matches
		if (resolvedHostname) {
			try {
				const addresses = await dns.resolve4(resolvedHostname);
				if (addresses.includes(ip)) {
					return {
						valid: true,
						hostname: resolvedHostname,
					};
				}

				return {
					valid: false,
					hostname: resolvedHostname,
					reason: "Forward DNS does not match reverse DNS",
				};
			} catch {
				return {
					valid: false,
					hostname: resolvedHostname,
					reason: "Could not verify forward DNS",
				};
			}
		}

		return {
			valid: false,
			reason: "Empty hostname from reverse DNS",
		};
	} catch (_error) {
		return {
			valid: false,
			reason: `rDNS lookup failed: ${_error instanceof Error ? _error.message : "Unknown error"}`,
		};
	}
}
