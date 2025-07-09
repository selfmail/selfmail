import { resolve4 } from "node:dns/promises";
import { status } from "elysia";
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

	static async handleAuthentication({
		username,
		password,
	}: SMTPModule.AuthenticationBody) {
		if (!username || !password) {
			throw status(400, {
				success: false,
				message: "Username and password are required for authentication.",
			});
		}

		return {
			success: true,
			message: "Authentication successful.",
		};
	}
}
