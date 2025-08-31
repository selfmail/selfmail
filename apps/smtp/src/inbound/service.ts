import { db } from "database";
import type {
	AddressObject,
	EmailAddress,
	HeaderValue,
	ParsedMail,
} from "mailparser";
import MailComposer from "nodemailer/lib/mail-composer";

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
		const compose = new MailComposer(mail as any);

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

					// Address information as JSON
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

					// Content
					text: mail.text || null,
					html: mail.html || null,

					// Headers
					headers: headersToJson(mail.headers)
						? JSON.parse(JSON.stringify(headersToJson(mail.headers)))
						: null,

					// Attachments metadata
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

					// Security and processing info
					warning: warning || null,
					processed: true,

					// Relations
					addressId: addressId,
					contactId: contact?.id || null,
				},
			});

			console.log(`Email saved successfully: ${savedEmail.id}`);
			return savedEmail;
		} catch (error) {
			console.error("Error saving email:", error);

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
					},
				});

				console.log(`Fallback email saved: ${fallbackEmail.id}`);
				return fallbackEmail;
			} catch (fallbackError) {
				console.error("Failed to save even fallback email:", fallbackError);
				throw error;
			}
		}
	}
}
