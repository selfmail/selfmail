import { t } from "elysia";

export namespace SMTPOutgoingModule {
	// connection
	export const ConnectionBody = t.Object({
		host: t.String({
			description: "The SMTP server host",
		}),
		ip: t.String({
			description: "The IP address of the SMTP server",
		}),
	});
	export type ConnectionBody = typeof ConnectionBody.static;

	// authentication
	export const AuthenticationBody = t.Object({
		username: t.String({
			description: "The username for SMTP authentication",
		}),
		password: t.String({
			description: "The password for SMTP authentication",
		}),
	});
	export type AuthenticationBody = typeof AuthenticationBody.static;

	// mail from
	export const MailFromBody = t.Object({
		from: t.String({
			format: "email",
			error: "Invalid email",
		}),
		addressId: t.String({
			description:
				"The address ID of the sender, fetched in the authentication step.",
		}),
	});
	export type MailFromBody = typeof MailFromBody.static;

	// rcpt to
	export const RcptToBody = t.Object({
		to: t.String({
			format: "email",
			description: "The email address of the recipient",
		}),
		addressId: t.String({
			description:
				"The address ID of the recipient, fetched in the authentication step.",
		}),
	});
	export type RcptToBody = typeof RcptToBody.static;

	// data
	export const DataBody = t.Object({
		body: t.String({
			description: "The raw email data in RFC 5322 format",
		}),
		addressId: t.String({
			description:
				"The address ID of the sender, fetched in the authentication step.",
		}),
		subject: t.String({
			description: "The subject of the email",
		}),
		html: t.Optional(
			t.String({
				description: "The optioanl HTML content of the email",
			}),
		),
		attachements: t.Optional(
			t.Files({
				description: "Optional attachments for the email",
			}),
		),
		preview: t.Optional(
			t.Boolean({
				description: "Whether to preview the email before sending",
			}),
		),
		from: t.String({
			format: "email",
			description: "The email address of the sender",
		}),
		to: t.String({
			description: "The address to send the email to.",
		}),
	});
	export type DataBody = typeof DataBody.static;
}
