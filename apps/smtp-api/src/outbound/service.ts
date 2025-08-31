import { resolve4 } from "node:dns/promises";
import { db } from "database";
import { status } from "elysia";
import type { OutboundModule } from "./module";

/**
 * This class handles the SMTP outgoing service, which is responsible for managing SMTP connections,
 * authentication, and email sending. It provides methods to handle connection requests, authenticate users,
 * validate email addresses, and process email data. The service is meant for the outgoing Selfmail SMTP Server,
 * in the `smtp` package. Rate-limiting will be handled by the SMTP server.
 */
export abstract class OutboundService {
	static async handleConnection({ ip, host }: OutboundModule.ConnectionBody) {
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
	}: OutboundModule.AuthenticationBody) {
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
				memberId: credentials.memberId,
			},
		};
	}

	/**
	 * The mail comes from a selfmail address, which is connected via the smtp credentials. This means, we
	 * can fetch the addressId based on the credentials used in the authentication step.
	 */
	static async handleMailFrom({
		from,
		addressId,
	}: OutboundModule.MailFromBody) {
		const address = await db.address.findUnique({
			where: {
				email: from,
			},
		});

		if (!address)
			throw status(404, {
				valid: false,
				message: "Address not found.",
			});

		if (address.email !== from)
			throw status(400, {
				valid: false,
				message: "Email address does not match the authenticated address.",
			});

		return {
			valid: true,
		};
	}

	/**
	 * Handle the RCPT TO command of the SMTP server. This method will check if the recipient email address is valid and that the contact exists in the database
	 * for the recipient's address. If not, a new contact will be created.
	 */
	static async handleRcptTo({ to }: OutboundModule.RcptToBody) {
		const address = await db.address.findUnique({
			where: {
				email: to,
			},
		});

		if (!address) throw status(404, "Not Found");
		const contact = await db.contact.findUnique({
			where: {
				email_addressId: {
					email: to,
					addressId: address.id,
				},
			},
		});

		if (!contact) {
			// If the contact does not exist, create a new one
			await db.contact.create({
				data: {
					email: to,
					addressId: address.id,
				},
			});
		}

		return {
			valid: true,
		};
	}
}
