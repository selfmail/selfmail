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
		html: t.String(),
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

	export const spamBody = t.Object({
		body: t.String({
			description: "Plain email body.",
		}),
		subject: t.String({
			description: "Email subject.",
		}),
		html: t.Optional(
			t.String({
				description: "Email HTML body.",
			}),
		),
		from: t.String({
			format: "email",
			description: "Sender email address.",
		}),
		to: t.String({
			format: "email",
			description: "Recipient email address.",
		}),
		attachments: t.Optional(
			t.Array(
				t.File({
					description: "Email attachment.",
					type: [
						// Text files
						"text/plain",
						"text/html",
						"text/csv",
						"text/rtf",
						// Documents
						"application/pdf",
						"application/msword",
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
						"application/vnd.ms-excel",
						"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
						"application/vnd.ms-powerpoint",
						"application/vnd.openxmlformats-officedocument.presentationml.presentation",
						"application/vnd.oasis.opendocument.text",
						"application/vnd.oasis.opendocument.spreadsheet",
						"application/vnd.oasis.opendocument.presentation",
						// Images
						"image/jpeg",
						"image/jpg",
						"image/png",
						"image/gif",
						"image/bmp",
						"image/webp",
						"image/svg+xml",
						"image/tiff",
						// Archives
						"application/zip",
						"application/x-rar-compressed",
						"application/x-7z-compressed",
						"application/x-tar",
						"application/gzip",
						// Audio/Video
						"audio/mpeg",
						"audio/wav",
						"audio/ogg",
						"video/mp4",
						"video/mpeg",
						"video/quicktime",
						"video/webm",
						// Other common types
						"application/json",
						"application/xml",
						"application/octet-stream",
					],
				}),
			),
		),
	});
	export type SpamBody = typeof spamBody.static;
}
