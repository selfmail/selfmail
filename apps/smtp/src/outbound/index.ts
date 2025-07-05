import { readFile } from "node:fs/promises";
import chalk from "chalk";
import { SMTPServer } from "smtp-server";
import { connection } from "./events/connection";

const options = {
	key: await readFile(
		"/etc/letsencrypt/live/mail.selfmail.app/privkey.pem" as string,
	),
	cert: await readFile("/etc/letsencrypt/live/mail.selfmail.app/fullchain.pem"),
};

export const outboundServer = new SMTPServer({
	name: "Selfmail Outbound SMTP Server",
	banner: "Welcome to Selfmail Outbound SMTP Server",
	secure: false, // false, because we use STARTTLS

	cert: options.cert,
	key: options.key,

	allowInsecureAuth: false,
	authMethods: ["PLAIN", "LOGIN", "CRAM-MD5"],
	size: 10 * 1024 * 1024,
	disableReverseLookup: true,
	useXClient: false,
	authOptional: false,
	hidePIPELINING: true,
	needsUpgrade: false,
	useProxy: false,
	maxClients: 1000,
	enableTrace: true,

	onAuth(auth, session, callback) {
		if (auth.method === "XOAUTH2") {
			return callback(
				new Error(
					"XOAUTH2 method is not allowed,Expecting LOGIN authentication",
				),
			);
		}
		console.log(
			`[OUTBOUND] Authentication attempt from ${session.remoteAddress}: ${auth.username}`,
		);

		// Simplified authentication - no STARTTLS requirement for now
		if (!auth.username || !auth.password) {
			return callback(new Error("Username and password required"));
		}

		// Basic password validation
		if (auth.password !== "selfmail_password") {
			return callback(new Error("Invalid password"));
		}

		console.log(`[OUTBOUND] Authentication successful for ${auth.username}`);
		return callback(undefined, {
			user: auth.username, // Store the email address as the user
		});
	},

	onConnect: connection,

	onMailFrom(address, session, callback) {
		console.log(
			`[OUTBOUND] MAIL FROM: ${address.address} from ${session.remoteAddress}`,
		);

		// Ensure authenticated user can only send from their own email
		if (session.user && session.user !== address.address) {
			console.log(
				`[OUTBOUND] User ${session.user} tried to send from ${address.address}`,
			);
			return callback(
				new Error("You can only send emails from your own email address"),
			);
		}

		return callback();
	},

	onRcptTo(address, session, callback) {
		console.log(
			`[OUTBOUND] RCPT TO: ${address.address} from ${session.remoteAddress}`,
		);
		return callback();
	},

	onData(stream, session, callback) {
		console.log("[OUTBOUND] Receiving data from " + session.remoteAddress);
		let emailContent = "";
		stream.on("data", (chunk) => (emailContent += chunk.toString()));
		stream.on("end", () => {
			console.log("[OUTBOUND] Email content received:");
			console.log(emailContent);
			// Here you would typically forward the email to an external SMTP server
			// For example, using nodemailer or another SMTP client library
			return callback(); // Signal that the email has been processed
		});
	},

	onClose(session) {
		console.log(`[OUTBOUND] Connection closed from ${session.remoteAddress}`);
	},
});
