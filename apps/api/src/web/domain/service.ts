import { promises as dns } from "node:dns";
import { db } from "database";
import { status } from "elysia";
import { Activity } from "../../lib/activity";
import { Analytics } from "../../lib/analytics";
import type { DomainModule } from "./module";

export abstract class DomainService {
	static async addDomain({
		domain,
		workspaceId,
		memberName,
	}: DomainModule.AddDomainBody & {
		workspaceId: string;
		memberName: string;
	}) {
		// TODO: check for current plan of the workspace, if it allows adding domains
		const domainDraft = await db.domain.create({
			data: {
				domain,
				workspaceId,
				verificationToken: crypto.randomUUID(), // Generate a unique verification token
			},
		});

		if (!domainDraft) return status(500, "Internal Server Error");

		Activity.capture({
			color: "positive",
			title: `Domain ${domainDraft.domain} added by user ${memberName} at ${new Date().toISOString()}.`,
			type: "event",
			workspaceId,
		});

		return status(200, {
			success: true,
			draftId: domainDraft.id,
		});
	}
	static async removeDomain({
		id,
		workspaceId,
		memberName,
	}: DomainModule.RemoveDomainBody & {
		workspaceId: string;
		memberName: string;
	}) {
		const domain = await db.domain.delete({
			where: {
				id,
				workspaceId,
			},
		});

		if (!domain) return status(404, "Domain not found");

		Analytics.trackEvent("domain_removed", {
			domain: domain.domain,
			workspaceId,
		});

		Activity.capture({
			color: "negative",
			title: `Domain ${domain.domain} removed by user ${memberName} at ${new Date().toISOString()}.`,
			type: "event",
			workspaceId,
		});

		return status(200, {
			success: true,
		});
	}
	static async listWorkspaceDomains({
		workspaceId,
	}: DomainModule.ListDomainsBody) {
		const domains = await db.domain.findMany({
			where: {
				workspaceId,
			},
		});

		return status(200, {
			success: true,
			domains,
		});
	}
	static async checkDomain({
		domainId,
		workspaceId,
	}: DomainModule.CheckDomainBody & {
		workspaceId: string;
	}) {
		const domain = await db.domain.findUnique({
			where: {
				id: domainId,
			},
		});

		if (!domain) return status(404, "Domain not found");

		// Check DNS records
		const dnsCheckResult = await DomainService.checkDomainDnsRecords(
			domain.domain,
			domain.verificationToken,
		);

		// If all checks passed, update the domain as verified
		if (dnsCheckResult.allChecksPass && !domain.verified) {
			Activity.capture({
				color: "positive",
				workspaceId,
				title: `Domain ${domain.domain} verified successfully.`,
				type: "event",
			});

			Analytics.trackEvent("domain_verified", {
				domain: domain.domain,
				workspaceId,
			});

			await db.domain.update({
				where: { id: domainId },
				data: {
					verified: true,
					verifiedAt: new Date(),
				},
			});
		}

		return status(200, {
			success: true,
			...dnsCheckResult,
		});
	}

	/**
	 * Checks if a domain has the required DNS entries:
	 * - MX record pointing to mail.selfmail.app
	 * - TXT record with verification token
	 * - SPF record (TXT record with v=spf1)
	 */
	static async checkDomainDnsRecords(
		domainName: string,
		verificationToken: string,
	) {
		try {
			// Initialize result object
			const result = {
				mxCheck: { pass: false, records: [] as string[], error: "" },
				txtVerificationCheck: {
					pass: false,
					records: [] as string[],
					error: "",
				},
				spfCheck: { pass: false, records: [] as string[], error: "" },
				allChecksPass: false,
			};

			// Check MX records
			try {
				const mxRecords = await dns.resolveMx(domainName);
				result.mxCheck.records = mxRecords.map(
					(record) => `${record.exchange} (priority: ${record.priority})`,
				);

				// Check if any MX record points to mail.selfmail.app
				result.mxCheck.pass = mxRecords.some(
					(record) => record.exchange.toLowerCase() === "mail.selfmail.app",
				);
			} catch (error) {
				result.mxCheck.error = `Failed to retrieve MX records: ${(error as Error).message}`;
			}

			// Check TXT records for verification token and SPF
			try {
				const txtRecords = await dns.resolveTxt(domainName);
				result.txtVerificationCheck.records = txtRecords.map((record) =>
					record.join(" "),
				);

				// Check if verification token exists in TXT records
				result.txtVerificationCheck.pass = txtRecords.some((record) =>
					record.join(" ").includes(verificationToken),
				);

				// Filter only SPF records
				const spfRecords = txtRecords.filter((record) =>
					record.join(" ").toLowerCase().startsWith("v=spf1"),
				);
				result.spfCheck.records = spfRecords.map((record) => record.join(" "));

				// Check if any SPF record exists
				result.spfCheck.pass = spfRecords.length > 0;
			} catch (error) {
				const errorMessage = `Failed to retrieve TXT records: ${(error as Error).message}`;
				result.txtVerificationCheck.error = errorMessage;
				result.spfCheck.error = errorMessage;
			}

			// All checks pass if all individual checks pass
			result.allChecksPass =
				result.mxCheck.pass &&
				result.txtVerificationCheck.pass &&
				result.spfCheck.pass;

			return result;
		} catch (error) {
			// Handle any unexpected errors
			return {
				mxCheck: { pass: false, records: [], error: "Unexpected error" },
				txtVerificationCheck: {
					pass: false,
					records: [],
					error: "Unexpected error",
				},
				spfCheck: { pass: false, records: [], error: "Unexpected error" },
				allChecksPass: false,
				error: (error as Error).message,
			};
		}
	}
}
