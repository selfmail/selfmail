import { resolveNs } from "node:dns/promises";
import { domainTxtHost, domainTxtValue } from "./domain-utils";
import type { DashboardWorkspaceDomain } from "./types";

const selfmailMxHost = "mail.selfmail.app";

export async function detectDnsProvider(domain: string) {
	try {
		const nameservers = await resolveNs(domain);

		return nameservers.some((nameserver) =>
			nameserver.toLowerCase().includes("cloudflare.com"),
		)
			? "cloudflare"
			: "other";
	} catch {
		return "unknown";
	}
}

export function toDashboardWorkspaceDomain(
	domain: {
		_count: {
			addresses: number;
		};
		createdAt: Date;
		domain: string;
		id: string;
		verificationToken: string;
		verified: boolean;
		verifiedAt: Date | null;
	},
	dnsProvider: DashboardWorkspaceDomain["dnsProvider"],
): DashboardWorkspaceDomain {
	return {
		addressCount: domain._count.addresses,
		createdAt: domain.createdAt.toISOString(),
		dnsProvider,
		dnsRecords: [
			{
				host: domainTxtHost(domain.domain),
				type: "TXT",
				value: domainTxtValue(domain.verificationToken),
			},
			{
				host: domain.domain,
				priority: 10,
				type: "MX",
				value: selfmailMxHost,
			},
		],
		domain: domain.domain,
		id: domain.id,
		status: domain.verified ? "verified" : "pending",
		verifiedAt: domain.verifiedAt?.toISOString() ?? null,
	};
}
