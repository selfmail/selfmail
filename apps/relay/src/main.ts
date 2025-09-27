import { Elysia, t } from "elysia";
import type { Attachment } from "mailparser";
import { EmailQueue } from "services/queue";

// Define the address object structure that matches OutboundEmail schema
type OutboundAddressObject = {
	value: { address: string; name?: string }[];
	text: string;
	html: string;
};

// Helper function to convert email string to OutboundAddressObject
function createAddressObject(
	email: string,
	name?: string,
): OutboundAddressObject {
	return {
		value: [{ address: email, name }],
		text: name ? `${name} <${email}>` : email,
		html: name ? `${name} &lt;${email}&gt;` : email,
	};
}

// Helper function to convert mixed array of emails to OutboundAddressObject array
function createAddressObjects(
	emails: (string | { email: string; name?: string })[],
): OutboundAddressObject[] {
	return emails.map((item) => {
		if (typeof item === "string") {
			return createAddressObject(item);
		}
		return createAddressObject(item.email, item.name);
	});
}

const app = new Elysia()
	.post(
		"/send",
		async ({ body }) => {
			console.log("Received relay connection");
			try {
				const {
					from,
					subject,
					text,
					to,
					html,
					cc,
					bcc,
					replyTo,
					attachments = [],
					headers = {},
					priority = "normal",
				} = body;

				// Convert addresses to proper format
				const fromAddress =
					typeof from === "string"
						? createAddressObject(from)
						: createAddressObject(from.email, from.name);

				const toAddresses = Array.isArray(to)
					? createAddressObjects(
							to as (string | { email: string; name?: string })[],
						)
					: [
							typeof to === "string"
								? createAddressObject(to)
								: createAddressObject(to.email, to.name),
						];

				const ccAddresses = cc
					? Array.isArray(cc)
						? createAddressObjects(
								cc as (string | { email: string; name?: string })[],
							)
						: [
								typeof cc === "string"
									? createAddressObject(cc)
									: createAddressObject(cc.email, cc.name),
							]
					: undefined;

				const bccAddresses = bcc
					? Array.isArray(bcc)
						? createAddressObjects(
								bcc as (string | { email: string; name?: string })[],
							)
						: [
								typeof bcc === "string"
									? createAddressObject(bcc)
									: createAddressObject(bcc.email, bcc.name),
							]
					: undefined;

				const replyToAddress = replyTo
					? typeof replyTo === "string"
						? createAddressObject(replyTo)
						: createAddressObject(replyTo.email, replyTo.name)
					: undefined;

				// Convert attachments to proper format
				const processedAttachments: Attachment[] = attachments.map((att) => ({
					filename: att.filename || "attachment",
					contentType: att.contentType || "application/octet-stream",
					content: Buffer.from(
						att.content,
						att.encoding === "base64" ? "base64" : "utf8",
					),
					size: att.size || 0,
					cid: att.cid || undefined,
					contentId: att.contentId || undefined,
					related: false,
					type: "attachment" as const,
					contentDisposition: "attachment",
					headers: new Map(),
					headerLines: [],
					checksum: "",
				}));

				// Convert headers to a plain object for JSON serialization
				const headerObject: Record<string, string> = {};
				for (const [key, value] of Object.entries(headers)) {
					// Ensure header values are strings
					headerObject[key] = typeof value === "string" ? value : String(value);
				}

				// Create properly structured OutboundEmail object
				const outboundEmail = {
					subject,
					text,
					html,
					to: toAddresses,
					from: fromAddress,
					cc: ccAddresses,
					bcc: bccAddresses,
					replyTo: replyToAddress,
					priority,
					attachments: processedAttachments,
					headers: headerObject, // Use plain object instead of Map
					headerLines: [],
					delay: body.delay,
				};

				await EmailQueue.processOutbound(outboundEmail);

				return {
					success: true,
					message: "Email queued successfully",
				};
			} catch (error) {
				console.error("Error processing outbound email:", error);
				return {
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		},
		{
			body: t.Object({
				// Required fields
				to: t.Union([
					t.String({ format: "email" }),
					t.Object({
						email: t.String({ format: "email" }),
						name: t.Optional(t.String()),
					}),
					t.Array(
						t.Union([
							t.String({ format: "email" }),
							t.Object({
								email: t.String({ format: "email" }),
								name: t.Optional(t.String()),
							}),
						]),
					),
				]),
				from: t.Union([
					t.String({ format: "email" }),
					t.Object({
						email: t.String({ format: "email" }),
						name: t.Optional(t.String()),
					}),
				]),
				subject: t.String(),
				text: t.String(),

				// Optional fields
				html: t.Optional(t.String()),
				cc: t.Optional(
					t.Union([
						t.String({ format: "email" }),
						t.Object({
							email: t.String({ format: "email" }),
							name: t.Optional(t.String()),
						}),
						t.Array(
							t.Union([
								t.String({ format: "email" }),
								t.Object({
									email: t.String({ format: "email" }),
									name: t.Optional(t.String()),
								}),
							]),
						),
					]),
				),
				bcc: t.Optional(
					t.Union([
						t.String({ format: "email" }),
						t.Object({
							email: t.String({ format: "email" }),
							name: t.Optional(t.String()),
						}),
						t.Array(
							t.Union([
								t.String({ format: "email" }),
								t.Object({
									email: t.String({ format: "email" }),
									name: t.Optional(t.String()),
								}),
							]),
						),
					]),
				),
				replyTo: t.Optional(
					t.Union([
						t.String({ format: "email" }),
						t.Object({
							email: t.String({ format: "email" }),
							name: t.Optional(t.String()),
						}),
					]),
				),
				priority: t.Optional(
					t.Union([t.Literal("normal"), t.Literal("low"), t.Literal("high")]),
				),
				attachments: t.Optional(
					t.Array(
						t.Object({
							filename: t.Optional(t.String()),
							contentType: t.Optional(t.String()),
							content: t.String(), // Base64 or plain text
							encoding: t.Optional(
								t.Union([t.Literal("base64"), t.Literal("utf8")]),
							),
							size: t.Optional(t.Number()),
							cid: t.Optional(t.String()),
							contentId: t.Optional(t.String()),
						}),
					),
				),
				headers: t.Optional(t.Record(t.String(), t.String())),
				delay: t.Optional(t.Number()),
			}),
		},
	)
	.listen({
		port: 4000,
	});

console.log(`Listening on ${app.server?.url}`);
