import { db } from "database";
import { status } from "elysia";
import type { InboundModule } from "./module";

// biome-ignore lint/complexity/noStaticOnlyClass: This is a static utility class for handling SMTP connections.
export abstract class InboundService {
	/**
	 * Connection of a new SMTP client. We are checking for spam (in the database) and if the
	 * connection comes from the localhost. We are also performing rate-limiting on the client's IP.
	 */
	static async handleConnection({
		hostname,
		ip,
	}: InboundModule.ConnectionBody) {
		return {
			valid: true,
		};
	}

	static async handleMailFrom({ from }: InboundModule.MailFromBody) {
		if (from.endsWith("@selfmail.app")) {
			throw status(403, "Selfmail addresses are not allowed");
		}

		return {
			valid: true,
		};
	}

	static async handleRcptTo({ to, mailFrom }: InboundModule.RcptToBody) {
		const address = await db.address.findUnique({
			where: {
				email: to,
			},
		});

		if (!address) {
			throw status(404, "Address not found");
		}

		const contact = await db.contact.findUnique({
			where: {
				email_addressId: {
					email: mailFrom,
					addressId: address.id,
				},
			},
		});

		if (contact?.blocked) {
			throw status(403, "Contact is blocked");
		}

		if (!contact) {
			const newContact = await db.contact.create({
				data: {
					email: mailFrom,
					addressId: address.id,
				},
			});

			if (!newContact) {
				throw status(500, "Failed to create contact");
			}
		}

		return {
			valid: true,
		};
	}

	// TODO: handle attachments properly (with cloudflare r2 or similar)
	static async handleData({
		attachments,
		subject,
		text,
		html,
		mailFrom,
		to,
	}: InboundModule.DataBody) {
		const address = await db.address.findUnique({
			where: {
				email: to,
			},
		});
		if (!address) {
			throw status(404, "Address not found");
		}
		const contact = await db.contact.findUnique({
			where: {
				email_addressId: {
					email: mailFrom,
					addressId: address.id,
				},
			},
		});
		if (!contact) {
			throw status(404, "Contact not found");
		}
		// save the email to the database
		const email = await db.email.create({
			data: {
				subject,
				body: text,
				html,
				addressId: address.id,
				contactId: contact.id,
			},
		});

		if (!email) {
			throw status(500, "Failed to save email");
		}

		return {
			valid: true,
		};
	}
}
