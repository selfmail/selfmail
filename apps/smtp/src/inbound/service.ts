import { db } from "database";
import type {
	AddressObject,
	EmailAddress,
	HeaderValue,
	ParsedMail,
} from "mailparser";
import MailComposer from "nodemailer/lib/mail-composer";
import { Logs } from "services/logs";

type Contact = {
	name: string | null;
	id: string;
	description: string | null;
	image: string | null;
	blocked: boolean;
	addressId: string;
	additionalInformation: unknown;
	email: string;
};

export abstract class Inbound {
	static async handleMultipleSenders(addresses: EmailAddress[], id: string) {
		const contacts: Contact[] = [];
		for await (const { address, name } of addresses) {
			if (!address) continue;
			const contact = await db.contact.findUnique({
				where: {
					email_addressId: {
						email: address,
						addressId: id,
					},
				},
			});

			if (!contact) {
				// Create new contact with name and email
				const contact = await db.contact.create({
					data: {
						email: address,
						addressId: id,
						name: name,
					},
				});

				contacts.push(contact);
			} else {
				contacts.push(contact);
			}
		}

		return contacts;
	}

	static async saveMailToS3(mail: ParsedMail) {
		// Convert headers Map to plain object compatible with nodemailer
		const headersObj: Record<
			string,
			string | string[] | { prepared: boolean; value: string }
		> = {};
		const toHeaderValue = (
			v: unknown,
		): string | string[] | { prepared: boolean; value: string } => {
			if (typeof v === "string") return v;
			if (
				Array.isArray(v) &&
				(v as unknown[]).every((x) => typeof x === "string")
			)
				return v as string[];
			if (v instanceof Date) return v.toUTCString();
			return String(v);
		};

		if (mail.headers instanceof Map) {
			for (const [key, value] of mail.headers.entries()) {
				headersObj[key] = toHeaderValue(value);
			}
		} else if (mail.headers && typeof mail.headers === "object") {
			for (const [key, value] of Object.entries(
				mail.headers as Record<string, unknown>,
			)) {
				headersObj[key] = toHeaderValue(value);
			}
		}

		const composerOptions = {
			...mail,
			from:
				typeof mail.from === "object"
					? mail.from.text
					: typeof mail.from === "string"
						? mail.from
						: undefined,
			to:
				typeof mail.to === "object"
					? Array.isArray(mail.to)
						? mail.to.map((t) => t.text).join(", ")
						: mail.to.text
					: typeof mail.to === "string"
						? mail.to
						: undefined,
			cc:
				typeof mail.cc === "object"
					? Array.isArray(mail.cc)
						? mail.cc.map((c) => c.text).join(", ")
						: mail.cc.text
					: typeof mail.cc === "string"
						? mail.cc
						: undefined,
			bcc:
				typeof mail.bcc === "object"
					? Array.isArray(mail.bcc)
						? mail.bcc.map((b) => b.text).join(", ")
						: mail.bcc.text
					: typeof mail.bcc === "string"
						? mail.bcc
						: undefined,
			replyTo:
				typeof mail.replyTo === "object"
					? Array.isArray(mail.replyTo)
						? mail.replyTo.map((r) => r.text).join(", ")
						: mail.replyTo.text
					: typeof mail.replyTo === "string"
						? mail.replyTo
						: undefined,
			html: mail.html === false ? undefined : mail.html,
			headers: headersObj,
			attachments: mail.attachments?.map((att) => ({
				filename: att.filename,
				content: att.content,
				contentType: att.contentType,
				cid: att.cid,
				contentDisposition:
					att.contentDisposition === "attachment" ||
					att.contentDisposition === "inline"
						? (att.contentDisposition as "attachment" | "inline")
						: undefined,
			})),
		};
		const compose = new MailComposer(composerOptions);

		const eml = await new Promise<Buffer>((resolve, reject) =>
			compose
				.compile()
				.build((err, message) => (err ? reject(err) : resolve(message))),
		);

		if (!eml) return;
	}

	static async save(mail: ParsedMail, addressId: string, warning?: string) {
		try {
			// Helper function to extract addresses
			const extractAddresses = (
				addressObj: AddressObject | AddressObject[] | undefined,
			): EmailAddress[] => {
				if (!addressObj) return [];
				if (Array.isArray(addressObj)) {
					return addressObj.flatMap((obj) => obj.value || []);
				}
				return addressObj.value || [];
			};

			// Helper function to convert headers to JSON
			const headersToJson = (
				headers: Map<string, HeaderValue> | undefined,
			): Record<string, HeaderValue> | null => {
				if (!headers) return null;
				const result: Record<string, HeaderValue> = {};
				if (headers instanceof Map) {
					for (const [key, value] of headers.entries()) {
						result[key] = value;
					}
				} else if (typeof headers === "object") {
					return headers as Record<string, HeaderValue>;
				}
				return result;
			};

			// Find or create contact for the sender using existing helper
			let contact = null;
			const fromAddresses = extractAddresses(mail.from);
			if (fromAddresses.length > 0) {
				const contacts = await Inbound.handleMultipleSenders(
					fromAddresses,
					addressId,
				);
				contact = contacts[0] || null; // Take the first sender as the primary contact
			}

			// Save the email
			const savedEmail = await db.email.create({
				data: {
					messageId: mail.messageId || null,
					subject: mail.subject || "No Subject",
					date: mail.date || new Date(),
					from: JSON.parse(JSON.stringify(extractAddresses(mail.from))),
					to: JSON.parse(JSON.stringify(extractAddresses(mail.to))),
					cc: mail.cc
						? JSON.parse(JSON.stringify(extractAddresses(mail.cc)))
						: null,
					bcc: mail.bcc
						? JSON.parse(JSON.stringify(extractAddresses(mail.bcc)))
						: null,
					replyTo: mail.replyTo
						? JSON.parse(JSON.stringify(extractAddresses(mail.replyTo)))
						: null,
					text: mail.text || null,
					html: mail.html || null,
					headers: headersToJson(mail.headers)
						? JSON.parse(JSON.stringify(headersToJson(mail.headers)))
						: null,
					attachments:
						mail.attachments?.map((att) => ({
							filename: att.filename,
							contentType: att.contentType,
							size: att.size,
							cid: att.cid,
							contentId: att.contentId,
							checksum: att.checksum,
							related: att.related,
						})) || null,
					warning: warning || null,
					processed: true,
					addressId: addressId,
					contactId: contact?.id || null,
					sizeBytes: mail.text ? Buffer.byteLength(mail.text, "utf8") : 0,
					sort: warning ? "spam" : "normal",
				},
			});

			Logs.log(`Email saved successfully: ${savedEmail.id}`);
			return savedEmail;
		} catch (error) {
			Logs.error(`Error saving email: ${error}`);

			// Try to save a minimal version if the full save fails
			try {
				const extractAddresses = (
					addressObj: AddressObject | AddressObject[] | undefined,
				): EmailAddress[] => {
					if (!addressObj) return [];
					if (Array.isArray(addressObj)) {
						return addressObj.flatMap((obj) => obj.value || []);
					}
					return addressObj.value || [];
				};

				const fallbackEmail = await db.email.create({
					data: {
						subject: mail.subject || "Failed to parse subject",
						from: JSON.parse(JSON.stringify(extractAddresses(mail.from))),
						to: JSON.parse(JSON.stringify(extractAddresses(mail.to))),
						text: mail.text || "Failed to parse content",
						html: mail.html || null,
						warning: `Save error: ${error instanceof Error ? error.message : "Unknown error"}`,
						processed: false,
						processingError:
							error instanceof Error ? error.message : "Unknown error",
						addressId: addressId,
						sizeBytes: mail.text ? Buffer.byteLength(mail.text, "utf8") : 0,
						sort: "normal",
					},
				});

				Logs.log(`Fallback email saved: ${fallbackEmail.id}`);
				return fallbackEmail;
			} catch (fallbackError) {
				Logs.error(`Failed to save even fallback email: ${fallbackError}`);
				throw error;
			}
		}
	}
}
