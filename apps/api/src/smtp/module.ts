import { t } from "elysia";

export namespace SMTPModule {
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
}
