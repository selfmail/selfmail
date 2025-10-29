import * as dns from "node:dns/promises";
import dmarcParse from "dmarc-parse";
import type {
	DMARCPolicy,
	DMARCRecord,
	SPFCheckResult,
} from "../../types/session";

/**
 * Check DMARC policy for the domain
 */
export async function checkDMARC(domain: string): Promise<DMARCRecord | null> {
	try {
		const dmarcDomain = `_dmarc.${domain}`;
		const txtRecords = await dns.resolveTxt(dmarcDomain);

		// Find DMARC record
		for (const record of txtRecords) {
			const recordString = Array.isArray(record) ? record.join("") : record;
			if (recordString.startsWith("v=DMARC1")) {
				console.log(
					`[MailFrom] Found DMARC record for ${domain}: ${recordString}`,
				);

				try {
					const parsed = dmarcParse(recordString);

					return {
						policy: (parsed.tags.p?.value || "none") as DMARCPolicy,
						subdomainPolicy: parsed.tags.sp?.value as DMARCPolicy | undefined,
						percentage: parsed.tags.pct?.value
							? Number.parseInt(parsed.tags.pct.value, 10)
							: 100,
						aspf: (parsed.tags.aspf?.value || "r") as "r" | "s",
						adkim: (parsed.tags.adkim?.value || "r") as "r" | "s",
						raw: recordString,
					};
				} catch (_parseError) {
					console.error(
						`[MailFrom] Failed to parse DMARC record: ${_parseError instanceof Error ? _parseError.message : "Unknown error"}`,
					);
					return null;
				}
			}
		}

		console.log(`[MailFrom] No DMARC record found for ${domain}`);
		return null;
	} catch (_error) {
		console.error(
			`[MailFrom] DMARC lookup error for ${domain}: ${_error instanceof Error ? _error.message : "Unknown error"}`,
		);
		return null;
	}
}

/**
 * Determine if email should be rejected based on SPF result and DMARC policy
 */
export function handleDMARC(
	spfResult: SPFCheckResult,
	dmarcRecord: DMARCRecord | null,
	emailAddress: string,
): boolean {
	// If no DMARC record, use environment variable for SPF failure handling
	if (!dmarcRecord) {
		if (
			spfResult.result === "fail" &&
			process.env.REJECT_ON_SPF_FAIL === "true"
		) {
			console.log(
				`[MailFrom] No DMARC policy, but REJECT_ON_SPF_FAIL=true - rejecting ${emailAddress}`,
			);
			return true;
		}
		return false;
	}

	// If SPF passed, no need to enforce DMARC
	if (spfResult.result === "pass") {
		return false;
	}

	// Handle based on DMARC policy
	const policy = dmarcRecord.policy;
	const percentage = dmarcRecord.percentage || 100;

	// Random sampling based on pct tag
	const shouldApplyPolicy = Math.random() * 100 < percentage;

	if (!shouldApplyPolicy) {
		console.log(
			`[MailFrom] DMARC policy not applied due to percentage sampling (${percentage}%) for ${emailAddress}`,
		);
		return false;
	}

	// Apply DMARC policy
	switch (policy) {
		case "reject":
			if (spfResult.result === "fail" || spfResult.result === "softfail") {
				console.log(
					`[MailFrom] DMARC policy=reject, SPF=${spfResult.result} - rejecting ${emailAddress}`,
				);
				return true;
			}
			break;

		case "quarantine":
			if (spfResult.result === "fail" || spfResult.result === "softfail") {
				console.log(
					`[MailFrom] DMARC policy=quarantine, SPF=${spfResult.result} - marking for quarantine ${emailAddress}`,
				);
				// For quarantine, we don't reject at MAIL FROM stage
				// Instead, we'll handle it in DATA handler (add to spam folder, etc.)
				return false;
			}
			break;

		case "none":
			console.log(
				`[MailFrom] DMARC policy=none, SPF=${spfResult.result} - monitoring only for ${emailAddress}`,
			);
			return false;

		default:
			console.warn(
				`[MailFrom] Unknown DMARC policy: ${policy} for ${emailAddress}`,
			);
			return false;
	}

	return false;
}
