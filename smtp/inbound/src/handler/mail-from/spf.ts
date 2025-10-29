import spfCheck from "spf-check";
import type { SPFCheckResult, SPFResult } from "../../types/session";

/**
 * Perform SPF check using spf-check library
 */
export async function checkSPF(
	ip: string,
	domain: string,
	email: string,
): Promise<SPFCheckResult> {
	try {
		// Skip SPF for localhost and private IPs
		if (
			ip === "127.0.0.1" ||
			ip === "::1" ||
			ip === "unknown" ||
			ip.startsWith("192.168.") ||
			ip.startsWith("10.") ||
			/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
		) {
			return {
				result: "pass",
				reason: "Private/local IP - SPF check skipped",
			};
		}

		console.log(
			`[MailFrom] Checking SPF for IP ${ip}, domain ${domain}, email ${email}`,
		);

		// Use spf-check library for proper SPF validation
		const result = await spfCheck(ip, domain, email);

		// Map spf-check result to our SPFResult type
		let spfResult: SPFResult;
		switch (result) {
			case "pass":
				spfResult = "pass";
				break;
			case "fail":
				spfResult = "fail";
				break;
			case "softfail":
				spfResult = "softfail";
				break;
			case "neutral":
				spfResult = "neutral";
				break;
			case "none":
				spfResult = "none";
				break;
			case "temperror":
				spfResult = "temperror";
				break;
			case "permerror":
				spfResult = "permerror";
				break;
			default:
				spfResult = "neutral";
		}

		return {
			result: spfResult,
			reason: `SPF check result: ${spfResult}`,
		};
	} catch (_error) {
		console.error(
			`[MailFrom] SPF check error for ${email}: ${_error instanceof Error ? _error.message : "Unknown error"}`,
		);
		return {
			result: "temperror",
			reason: "Temporary error during SPF lookup",
		};
	}
}
