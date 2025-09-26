import { readFileSync } from "node:fs";
import { SMTPServer } from "smtp-server";
import { auth } from "./events/auth";
import { close } from "./events/close";
import { connection } from "./events/connection";
import { data } from "./events/data";
import { mailFrom } from "./events/mail-from";
import { recipient } from "./events/recipient";

const options = {
	key: readFileSync(`${process.env.CERTIFICATE_PATH}/privkey.pem`, "utf8"),
	cert: readFileSync(`${process.env.CERTIFICATE_PATH}/fullchain.pem`, "utf8"),
};

export const outboundServer = new SMTPServer({
	name: "Selfmail",
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
	handshakeTimeout: 60000,
	socketTimeout: 60000, // Increase socket timeout to 60 seconds
	closeTimeout: 60000, // Increase connection timeout to 60 seconds
	maxClients: 1000,
	enableTrace: true,

	/*
	 * Handlers for the SMTP Server. On each event, the handler in the `./events/` folder gets called.
	 * Each handler should return a Promise<void> and call the callback when done.
	 *
	 * Flow:
	 * 1. onConnect: Checks the connection, DNSBL, and logs the connection
	 * 2. onAuth: Handles authentication, checks credentials, and logs the user
	 * 3. onMailFrom: Validates the sender's email address
	 * 4. onRcptTo: Validates the recipient's email address
	 * 5. onData: Processes the email data, saves it to the database, and sends it to the recipient
	 * 6. onClose: Cleans up the session and logs the closure
	 */
	onConnect: connection,
	onAuth: auth,
	onMailFrom: mailFrom,
	onRcptTo: recipient,
	onData: data,
	onClose: close,
});
