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
			description: "The email address of the recipient",
		}),
	});
	export type RcptToBody = typeof RcptToBody.static;

	// data
	export const DataBody = t.Object({
		data: t.String({
			description: "The raw email data",
		}),
	});
	export type DataBody = typeof DataBody.static;
}
