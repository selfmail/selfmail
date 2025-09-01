import { Elysia, t } from "elysia";
import type { AddressObject, Attachment, HeaderValue } from "mailparser";
import { Queue } from "services/queue";

// Helper function to convert email string to AddressObject
function createAddressObject(email: string, name?: string): AddressObject {
	return {
		value: [{ address: email, name: name || "" }],
		text: name ? `${name} <${email}>` : email,
		html: name ? `${name} &lt;${email}&gt;` : email,
	};
}

// Helper function to convert mixed array of emails to AddressObject array
function createAddressObjects(
	emails: (string | { email: string; name?: string })[],
): AddressObject[] {
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

				// Convert headers to Map with proper types
				const headerMap = new Map<string, HeaderValue>();
				for (const [key, value] of Object.entries(headers)) {
					headerMap.set(key, value as HeaderValue);
				}

				await Queue.processOutbound({
					from: fromAddress,
					subject,
					text,
					html: html || false,
					to: toAddresses.length === 1 ? toAddresses[0] : toAddresses,
					cc:
						ccAddresses && ccAddresses.length === 1
							? ccAddresses[0]
							: ccAddresses,
					bcc:
						bccAddresses && bccAddresses.length === 1
							? bccAddresses[0]
							: bccAddresses,
					replyTo: replyToAddress,
					priority,
					attachments: processedAttachments,
					headers: headerMap,
					headerLines: [],
					delay: body.delay || 0,
				});

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
	.listen(4000);

console.log(`Listening on ${app.server?.url}`);
