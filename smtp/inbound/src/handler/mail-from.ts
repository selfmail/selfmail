import type { SMTPServerAddress } from "smtp-server";
import z from "zod";
import type { Callback } from "../types";
import type { ExtendedSession } from "../types/session";
import { blocked } from "./mail-from/blocked";
import {
	checkDMARC,
	checkSPF,
	extractDomain,
	handleDMARC,
	performReverseDNSCheck,
	verifyDomainExists,
} from "./mail-from/index";

export abstract class MailFrom {
	static async init(
		address: SMTPServerAddress,
		session: ExtendedSession,
		callback: (err?: Error) => void,
	): Promise<ReturnType<Callback>> {
		// Initialize session metadata
		if (!session.meta) {
			session.meta = {
				spamScore: 0,
			};
		} else {
			session.meta.spamScore = 0;
		}

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

			const domain = extractDomain(emailAddress);
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

			// Check if sender is blocked
			const isBlocked = await blocked(emailAddress);

			if (isBlocked) {
				// Log and reject blocked senders
				console.warn(`[MailFrom] Rejected: Sender is blocked: ${emailAddress}`);
				return callback(
					new Error(
						`MAIL FROM rejected: Sender ${emailAddress} is blocked. Contact us to unblock.`,
					),
				);
			}

			//Perform reverse DNS lookup (rDNS check)
			const rDNSResult = await performReverseDNSCheck(clientIP, clientHostname);
			if (!rDNSResult.valid) {
				console.warn(
					`[MailFrom] Warning: rDNS check failed for ${clientIP}: ${rDNSResult.reason}`,
				);
			}

			// Verify domain exists (DNS MX or A record check)
			const domainExists = await verifyDomainExists(domain);
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

			const spfResult = await checkSPF(clientIP, domain, emailAddress);
			console.log(
				`[MailFrom] SPF check for ${emailAddress}: ${spfResult.result} - ${spfResult.reason || "N/A"}`,
			);

			const dmarcRecord = await checkDMARC(domain);
			console.log(
				`[MailFrom] DMARC policy for ${domain}: ${dmarcRecord?.policy || "none"}`,
			);

			// Store SPF result in session metadata
			session.meta.spfResult = spfResult.result; // Handle SPF failures according to DMARC policy
			const shouldReject = handleDMARC(spfResult, dmarcRecord, emailAddress);
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

			// Store sender information in session for RCPT TO and DATA handlers
			if (!session.envelope) {
				// biome-ignore lint/suspicious/noExplicitAny: smtp-server envelope type is incomplete
				session.envelope = {} as any;
			}
			// biome-ignore lint/suspicious/noExplicitAny: extending envelope with custom mailFrom property
			(session.envelope as any).mailFrom = {
				address: emailAddress,
				domain,
				rDNS: rDNSResult,
				spf: spfResult,
				dmarc: dmarcRecord,
				timestamp: new Date(),
			}; // Update spam score based on checks
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
}
