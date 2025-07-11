import { t } from "elysia";
export namespace InboundModule {
	// Connection from a new server to our
	// inbound SMTP server.
	export const connectionBody = t.Object({
		hostname: t.String(),
		ip: t.String(),
	});
	export type ConnectionBody = typeof connectionBody.static;

	// Mail form a new server.
	export const mailFromBody = t.Object({
		from: t.String({
			format: "email",
		}),
	});
	export type MailFromBody = typeof mailFromBody.static;

	// RCPT TO from a new server.
	export const rcptToBody = t.Object({
		to: t.String({
			format: "email",
		}),
		mailFrom: t.String({
			format: "email",
		}),
	});
	export type RcptToBody = typeof rcptToBody.static;

	// Data for the SMTP DATA command.
	export const dataBody = t.Object({
		subject: t.String(),
		html: t.String().optional(),
		text: t.String(),
		attachments: t.Files(),
		to: t.String({
			format: "email",
		}),
		mailFrom: t.String({
			format: "email",
		}),
	});
	export type DataBody = typeof dataBody.static;
}
