import { SMTPServer } from "smtp-server";
import { handleConnection } from "./events/connection";
import { handleData } from "./events/data";
import { handleMailFrom } from "./events/mail-from";
import { handleRcptTo } from "./events/recipient";

export const inboundServer = new SMTPServer({
	name: "Selfmail Inbound Server",
	banner: "Welcome to Selfmail Inbound SMTP Server",

	disabledCommands: ["AUTH", "STARTTLS"],
	secure: false,

	size: 25 * 1024 * 1024, // 25 MB

	/**
	 * Event handlers for the smtp server. These are async functions that handle
	 * the api requests to the private smtp-api-server.
	 */
	onConnect: handleConnection,
	onMailFrom: handleMailFrom,
	onRcptTo: handleRcptTo,
	onData: handleData,
});
