import { Elysia } from "elysia";
import { RelayModule } from "../modules";
import { DNSLookupService } from "../services/dns";

export const dnsController = new Elysia({
	prefix: "/dns",
	name: "dns-controller",
	detail: {
		tags: ["DNS Lookup"],
		description: "DNS lookup utilities for domain resolution",
	},
})
	.model({
		"dns.domain": RelayModule.DomainParam,
		"dns.bulk": RelayModule.BulkDNSRequest,
		"dns.response": RelayModule.DNSResponse,
		"dns.bulkResponse": RelayModule.BulkDNSResponse,
		"relay.target": RelayModule.RelayTargetResponse,
	})
	.get(
		"/:domain",
		async ({ params: { domain } }) => {
			try {
				const [mx, a] = await Promise.allSettled([
					DNSLookupService.getMxRecords(domain),
					DNSLookupService.getARecords(domain),
				]);

				return {
					domain,
					mx:
						mx.status === "fulfilled"
							? mx.value
							: { error: mx.reason?.message || "Failed to resolve MX records" },
					a:
						a.status === "fulfilled"
							? a.value
							: { error: a.reason?.message || "Failed to resolve A records" },
				};
			} catch (error) {
				return {
					domain,
					mx: { error: "Failed to resolve MX records" },
					a: { error: "Failed to resolve A records" },
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		},
		{
			params: "dns.domain",
			response: {
				200: "dns.response",
			},
			detail: {
				summary: "Lookup DNS records for domain",
				description:
					"Retrieves MX and A records for the specified domain with caching",
				tags: ["DNS Lookup"],
			},
		},
	)
	.post(
		"/bulk",
		async ({ body }) => {
			const results = await Promise.allSettled(
				body.domains.map(async (domain) => {
					try {
						const targets = await DNSLookupService.getMxRecords(domain);
						return { domain, success: true, data: targets, error: null };
					} catch (error) {
						return {
							domain,
							success: false,
							data: null,
							error: error instanceof Error ? error.message : "Unknown error",
						};
					}
				}),
			);

			return {
				results: results.map((result, index) => {
					const domain = body.domains[index] || "unknown"; // Provide fallback for domain
					return {
						domain,
						success:
							result.status === "fulfilled" ? result.value.success : false,
						data: result.status === "fulfilled" ? result.value.data : null,
						error:
							result.status === "fulfilled"
								? result.value.error
								: result.reason?.message || "Unknown error",
					};
				}),
			};
		},
		{
			body: "dns.bulk",
			response: {
				200: "dns.bulkResponse",
			},
			detail: {
				summary: "Bulk DNS lookup",
				description:
					"Performs DNS MX record lookup for multiple domains in parallel",
				tags: ["DNS Lookup"],
			},
		},
	);
