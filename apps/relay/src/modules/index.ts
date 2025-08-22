import { t } from "elysia";

// Validation schemas using TypeBox
export const RelayModule = {
	// Email data schema for relay requests
	EmailData: t.Object({
		from: t.String({ format: "email" }),
		to: t.Array(t.String({ format: "email" })),
		cc: t.Optional(t.Array(t.String({ format: "email" }))),
		bcc: t.Optional(t.Array(t.String({ format: "email" }))),
		subject: t.String(),
		text: t.Optional(t.String()),
		html: t.Optional(t.String()),
		attachments: t.Optional(
			t.Array(
				t.Object({
					filename: t.String(),
					content: t.String(),
					contentType: t.String(),
					cid: t.Optional(t.String()),
				}),
			),
		),
	}),

	SMTPConfig: t.Object({
		host: t.String(),
		port: t.Number(),
		secure: t.Boolean(),
		auth: t.Optional(
			t.Object({
				user: t.String(),
				pass: t.String(),
			}),
		),
		tls: t.Optional(
			t.Object({
				rejectUnauthorized: t.Boolean(),
			}),
		),
	}),

	SendEmailRequest: t.Object({
		email: t.Ref("#EmailData"),
		smtp: t.Optional(t.Ref("#SMTPConfig")),
	}),

	// Domain parameter schema
	DomainParam: t.Object({
		domain: t.String(),
	}),

	// Bulk DNS request schema
	BulkDNSRequest: t.Object({
		domains: t.Array(t.String()),
	}),

	// Relay target response schema
	RelayTargetResponse: t.Object({
		domain: t.String(),
		priority: t.Number(),
		host: t.String(),
		ipv4: t.Optional(t.Array(t.String())),
		ipv6: t.Optional(t.Array(t.String())),
	}),

	// Standard response schema
	StandardResponse: t.Object({
		success: t.Boolean(),
		message: t.Optional(t.String()),
		error: t.Optional(t.String()),
		relayTargets: t.Optional(t.Array(t.Ref("RelayTarget"))),
		timestamp: t.String(),
	}),

	// Health check response
	HealthResponse: t.Object({
		status: t.String(),
		timestamp: t.String(),
		uptime: t.Number(),
	}),

	// DNS lookup response
	DNSResponse: t.Object({
		domain: t.String(),
		mx: t.Union([
			t.Array(t.Ref("RelayTarget")),
			t.Object({ error: t.String() }),
		]),
		a: t.Union([t.Array(t.String()), t.Object({ error: t.String() })]),
		error: t.Optional(t.String()),
	}),

	// Bulk DNS response
	BulkDNSResponse: t.Object({
		results: t.Array(
			t.Object({
				domain: t.String(),
				success: t.Boolean(),
				data: t.Union([t.Array(t.Ref("RelayTarget")), t.Null()]),
				error: t.Union([t.String(), t.Null()]),
			}),
		),
	}),

	// Stats response
	StatsResponse: t.Object({
		cacheSize: t.Number(),
		uptime: t.Number(),
		memory: t.Object({
			rss: t.Number(),
			heapTotal: t.Number(),
			heapUsed: t.Number(),
			external: t.Number(),
			arrayBuffers: t.Number(),
		}),
		timestamp: t.String(),
	}),
} as const;

// Type exports for use in services
export type EmailDataType = typeof RelayModule.EmailData.static;
export type DomainParamType = typeof RelayModule.DomainParam.static;
export type BulkDNSRequestType = typeof RelayModule.BulkDNSRequest.static;
