import * as dns from "node:dns/promises";
import dmarcParse from "dmarc-parse";
import type { SMTPServerAddress } from "smtp-server";
import spfCheck from "spf-check";
import z from "zod";
import { rspamd } from "../lib/rspamd";
import type { Callback } from "../types";
import type { ExtendedSession } from "../types/session";

type SPFResult =
	| "pass"
	| "fail"
	| "softfail"
	| "neutral"
	| "none"
	| "temperror"
	| "permerror";

type DMARCPolicy = "none" | "quarantine" | "reject";

type SPFCheckResult = {
	result: SPFResult;
	reason?: string;
	mechanism?: string;
};

type DMARCRecord = {
	policy: DMARCPolicy;
	subdomainPolicy?: DMARCPolicy;
	percentage?: number;
	aspf?: "r" | "s"; // SPF alignment mode (relaxed/strict)
	adkim?: "r" | "s"; // DKIM alignment mode (relaxed/strict)
	raw?: string;
};

export abstract class MailFrom {
	static async init(
		address: SMTPServerAddress,
		session: ExtendedSession,
		callback: (err?: Error) => void,
	): Promise<ReturnType<Callback>> {
		// Initialize session metadata
		if (!session.meta) {
			session.meta = {};
		}
		session.meta.spamScore = 0;

		try {
			if (!address || !address.address) {
				console.warn("[MailFrom] Rejected: No email address provided");
				return callback(
					new Error("MAIL FROM rejected: No email address provided"),
				);
			}

			const emailAddress = address.address.toLowerCase();
			const clientIP = session.remoteAddress || "unknown";
			const clientHostname =
				session.clientHostname || session.hostNameAppearsAs || "unknown";

			console.log(
				`[MailFrom] Processing MAIL FROM: ${emailAddress} from ${clientIP} (${clientHostname})`,
			);

			const emailValidation = await z.email().safeParseAsync(emailAddress);
			if (!emailValidation.success) {
				console.warn(
					`[MailFrom] Rejected: Invalid email address format: ${emailAddress}`,
				);
				return callback(
					new Error(
						`MAIL FROM rejected: Invalid email address format: ${emailAddress}`,
					),
				);
			}

			const domain = MailFrom.extractDomain(emailAddress);
			if (!domain) {
				console.warn(
					`[MailFrom] Rejected: Could not extract domain from: ${emailAddress}`,
				);
				return callback(
					new Error(
						`MAIL FROM rejected: Invalid email domain: ${emailAddress}`,
					),
				);
			}

			// 4. Perform reverse DNS lookup (rDNS check)
			const rDNSResult = await MailFrom.performReverseDNSCheck(
				clientIP,
				clientHostname,
			);
			if (!rDNSResult.valid) {
				console.warn(
					`[MailFrom] Warning: rDNS check failed for ${clientIP}: ${rDNSResult.reason}`,
				);
			}

			// 5. Verify domain exists (DNS MX or A record check)
			const domainExists = await MailFrom.verifyDomainExists(domain);
			if (!domainExists) {
				console.warn(
					`[MailFrom] Rejected: Domain does not exist or has no MX/A records: ${domain}`,
				);
				return callback(
					new Error(
						`MAIL FROM rejected: Domain ${domain} does not exist or cannot receive email`,
					),
				);
			}

			const spfResult = await MailFrom.checkSPF(clientIP, domain, emailAddress);
			console.log(
				`[MailFrom] SPF check for ${emailAddress}: ${spfResult.result} - ${spfResult.reason || "N/A"}`,
			);

			const dmarcRecord = await MailFrom.checkDMARC(domain);
			console.log(
				`[MailFrom] DMARC policy for ${domain}: ${dmarcRecord?.policy || "none"}`,
			);

			// Store SPF result in session metadata
			session.meta.spfResult = spfResult.result; // Handle SPF failures according to DMARC policy
			const shouldReject = MailFrom.handleDMARC(
				spfResult,
				dmarcRecord,
				emailAddress,
			);
			if (shouldReject) {
				console.warn(
					`[MailFrom] Rejected: SPF check failed and DMARC policy requires rejection for ${emailAddress}`,
				);
				return callback(
					new Error(
						`MAIL FROM rejected: SPF validation failed and DMARC policy=${dmarcRecord?.policy || "unknown"}`,
					),
				);
			}

			// 8. Check with Rspamd for additional spam filtering
			try {
				const rspamdResult = await rspamd.checkConnection({
					ip: clientIP,
					helo: clientHostname !== "unknown" ? clientHostname : undefined,
				});

				console.log(
					`[MailFrom] Rspamd sender check - Action: ${rspamdResult.action}, Score: ${rspamdResult.score}`,
				);

				if (!rspamdResult.allowed) {
					console.warn(
						`[MailFrom] Rejected by Rspamd - ${rspamdResult.reason || "Spam detected"}`,
					);
					return callback(
						new Error(
							`MAIL FROM rejected: ${rspamdResult.reason || "Message blocked by spam filter"}`,
						),
					);
				}
			} catch (rspamdError) {
				console.error(
					`[MailFrom] Rspamd check failed: ${rspamdError instanceof Error ? rspamdError.message : "Unknown error"}`,
				);
				// Fail-open: continue if Rspamd is unavailable
			}

			// 9. Store sender information in session for RCPT TO and DATA handlers
			// biome-ignore lint/suspicious/noExplicitAny: smtp-server envelope doesn't have custom properties in types
			session.envelope = session.envelope || ({} as any);
			// biome-ignore lint/suspicious/noExplicitAny: storing custom sender data in envelope
			(session.envelope as any).mailFrom = {
				address: emailAddress,
				domain: domain,
				rDNS: rDNSResult,
				spf: spfResult,
				dmarc: dmarcRecord,
				timestamp: new Date(),
			};

			// Update spam score based on checks
			if (spfResult.result === "fail") {
				session.meta.spamScore = (session.meta.spamScore || 0) + 5;
			} else if (spfResult.result === "softfail") {
				session.meta.spamScore = (session.meta.spamScore || 0) + 2;
			}

			if (!rDNSResult.valid) {
				session.meta.spamScore = (session.meta.spamScore || 0) + 1;
			}
			console.log(
				`[MailFrom] Accepted MAIL FROM: ${emailAddress} from ${clientIP}`,
			);
			return callback();
		} catch (error) {
			console.error(
				`[MailFrom] Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			// Fail-safe: reject on unexpected errors
			return callback(
				new Error(
					"MAIL FROM rejected: Internal server error during validation",
				),
			);
		}
	}
	private static extractDomain(email: string): string | null {
		const parts = email.split("@");
		return parts.length === 2 && parts[1] ? parts[1] : null;
	}

	private static async performReverseDNSCheck(
		ip: string,
		_reportedHostname: string,
	): Promise<{ valid: boolean; hostname?: string; reason?: string }> {
		try {
			// Skip rDNS for localhost and private IPs
			if (
				ip === "127.0.0.1" ||
				ip === "::1" ||
				ip.startsWith("192.168.") ||
				ip.startsWith("10.") ||
				/^172.(1[6-9]|2[0-9]|3[0-1])./.test(ip)
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
				reason: `rDNS lookup failed: $error instanceof Error ? error.message : "Unknown error"`,
			};
		}
	}

	private static async verifyDomainExists(domain: string): Promise<boolean> {
		try {
			// First try MX records (preferred for email)
			try {
				const mxRecords = await dns.resolveMx(domain);
				if (mxRecords && mxRecords.length > 0) {
					console.log(
						"[MailFrom] Domain $domainhas $mxRecords.lengthMX record(s)",
					);
					return true;
				}
			} catch {
				// MX lookup failed, try A record fallback
			}

			// Fallback to A record (some domains receive email without MX)
			try {
				const aRecords = await dns.resolve4(domain);
				if (aRecords && aRecords.length > 0) {
					console.log("[MailFrom] Domain $domainhas A record (no MX)");
					return true;
				}
			} catch {
				// A lookup failed
			}

			// Try AAAA record as final fallback
			try {
				const aaaaRecords = await dns.resolve6(domain);
				if (aaaaRecords && aaaaRecords.length > 0) {
					console.log("[MailFrom] Domain $domainhas AAAA record (no MX/A)");
					return true;
				}
			} catch {
				// All lookups failed
			}

			return false;
		} catch (_error) {
			console.error(
				`[MailFrom] Error verifying domain $domain: $error instanceof Error ? error.message : "Unknown error"`,
			);
			return false;
		}
	}

	/**
	 * Check DMARC policy for the domain
	 */
	private static async checkDMARC(domain: string): Promise<DMARCRecord | null> {
		try {
			const dmarcDomain = "_dmarc.$domain";
			const txtRecords = await dns.resolveTxt(dmarcDomain);

			// Find DMARC record
			for (const record of txtRecords) {
				const recordString = Array.isArray(record) ? record.join("") : record;
				if (recordString.startsWith("v=DMARC1")) {
					console.log(
						`[MailFrom] Found DMARC record for ${domain}: $recordString`,
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
							`[MailFrom] Failed to parse DMARC record: $parseError instanceof Error ? parseError.message : "Unknown error"`,
						);
						return null;
					}
				}
			}

			console.log(`[MailFrom] No DMARC record found for ${domain}`);
			return null;
		} catch (_error) {
			console.error(
				`[MailFrom] DMARC lookup error for ${domain}: $error instanceof Error ? error.message : "Unknown error"`,
			);
			return null;
		}
	}

	/**
	 * Determine if email should be rejected based on SPF result and DMARC policy
	 */
	private static handleDMARC(
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
					"[MailFrom] No DMARC policy, but REJECT_ON_SPF_FAIL=true - rejecting $emailAddress",
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
						"[MailFrom] DMARC policy=reject, SPF=$spfResult.result- rejecting $emailAddress",
					);
					return true;
				}
				break;

			case "quarantine":
				if (spfResult.result === "fail" || spfResult.result === "softfail") {
					console.log(
						`[MailFrom] DMARC policy=quarantine, SPF=$spfResult.result- marking for quarantine ${emailAddress}`,
					);
					// For quarantine, we don't reject at MAIL FROM stage
					// Instead, we'll handle it in DATA handler (add to spam folder, etc.)
					return false;
				}
				break;

			case "none":
				console.log(
					`[MailFrom] DMARC policy=none, SPF=$spfResult.result- monitoring only for ${emailAddress}`,
				);
				return false;

			default:
				console.warn(
					`[MailFrom] Unknown DMARC policy: $policyfor ${emailAddress}`,
				);
				return false;
		}

		return false;
	}

	/**
	 * Perform SPF check using spf-check library
	 */
	private static async checkSPF(
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
				`[MailFrom] Checking SPF for IP ${ip}, domain $domain, email $email`,
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
				reason: "SPF check result: $spfResult",
			};
		} catch (_error) {
			console.error(
				`[MailFrom] SPF check error for ${email}: $error instanceof Error ? error.message : "Unknown error"`,
			);
			return {
				result: "temperror",
				reason: "Temporary error during SPF lookup",
			};
		}
	}
}
