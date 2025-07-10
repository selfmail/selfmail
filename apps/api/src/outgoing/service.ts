import { resolve4 } from "node:dns/promises";
import { status } from "elysia";
import { db } from "../lib/db";
import type { SMTPOutgoingModule } from "./module";

// biome-ignore lint/complexity/noStaticOnlyClass: This is a static utility class for handling SMTP connections.
export abstract class SMTPOutgoingService {
	static async handleConnection({
		ip,
		host,
	}: SMTPOutgoingModule.ConnectionBody) {
		const invalidHostDueToLocalhost = () => {
			throw status(403, {
				success: false,
				message: "Connection to localhost is not allowed for security reasons.",
			});
		};

		switch (host) {
			case "localhost":
				return invalidHostDueToLocalhost();
			case "127.0.0.2":
				return invalidHostDueToLocalhost();
		}

		// checking for spamhouse
		const reversedIp = ip.split(".").reverse().join(".");
		const query = `${reversedIp}.zen.spamhaus.org`;

		try {
			await resolve4(query);
			throw status(403, {
				success: false,
				message: "Connection blocked due to being listed in Spamhaus.",
			});
		} catch {
			// Not listed in Spamhaus, allow connection to proceed
		}

		return {
			success: true,
			message: "Connection to SMTP server is allowed.",
		};
	}

	/**
	 * Handle SMTP authentication (the AUTH command). This method will check the provided username and password against the database.
	 * If the credentials are valid, it will return a success response. If not, it will throw a 401 Unauthorized error. The SMTP server
	 * will handle the response.
	 */
	static async handleAuthentication({
		username,
		password,
	}: SMTPOutgoingModule.AuthenticationBody) {
		const credentials = await db.smtpCredentials.findUnique({
			where: {
				username_password: {
					username,
					password,
				},
			},
		});

		if (!credentials) {
			throw status(401, {
				valid: false,
				message: "Invalid SMTP credentials.",
			});
		}

		return {
			valid: true,
			credentials: {
				workspaceId: credentials.workspaceId,
				addressId: credentials.addressId,
			},
		};
	}

	static async handleMailFrom({
		from,
		addressId,
	}: SMTPOutgoingModule.MailFromBody) {
		const [user, domain] = from.split("@");

		if (!user || !domain) {
			throw status(400, {
				valid: false,
				message: "Invalid email format.",
			});
		}

		let contactId: string | null = null;

		const contact = await db.contact.findUnique({
			where: {
				email_addressId: {
					email: from,
					addressId,
				},
			},
		});

		if (!contact) {
			const newContact = await db.contact.create({
				data: {
					email: from,
					addressId,
				},
			});

			contactId = newContact.id;
		} else {
			contactId = contact.id;
		}

		if (!contactId) {
			throw status(500, {
				valid: false,
				message: "Failed to create or find contact for the email.",
			});
		}

		return {
			valid: true,
		};
	}
}
