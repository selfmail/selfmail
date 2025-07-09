import { resolve4 } from "node:dns/promises";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";
import { db } from "../db";
import { smtpCrendetials } from "../db/schema/workspace";
import type { SMTPModule } from "./module";

// biome-ignore lint/complexity/noStaticOnlyClass: This is a static utility class for handling SMTP connections.
export abstract class SMTPService {
	static async handleConnection({ ip, host }: SMTPModule.ConnectionBody) {
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
	}: SMTPModule.AuthenticationBody) {
		const credentials = await db
			.select()
			.from(smtpCrendetials)
			.where(
				and(
					eq(smtpCrendetials.username, username),
					eq(smtpCrendetials.password, password),
				),
			)
			.limit(1);

		if (credentials.length === 0) {
			throw status(401, {
				valid: false,
				message: "Invalid SMTP credentials.",
			});
		}

		return {
			
		};
	}

	static async verifyMailFrom(from: string) {
		const [user, domain] = from.split("@");

		if (!user || !domain) {
			throw status(400, {
				valid: false,
				message: "Invalid email format.",
			});
		}

		const credentials = await db
			.select()
			.from(smtpCrendetials)
			.where(eq(smtpCrendetials.username, user))
			.limit(1);

		if (credentials.length === 0) {
			return {
				valid: false,
				message: "Email address not found.",
			};
		}

		return {
			id: 
		};
	}
}
