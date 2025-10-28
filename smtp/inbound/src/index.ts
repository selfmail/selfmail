import { SMTPServer } from "smtp-server";
import { Connection } from "./handler/connection";
import { MailFrom } from "./handler/mail-from";

const smtpServer = new SMTPServer({
	name: "Inbound Selfmail SMTP Server",
	banner: "Welcome to Selfmail Inbound SMTP Server",

	disabledCommands: ["AUTH", "STARTTLS"],
	secure: false,

	size: 25 * 1024 * 1024, // max size: 25 megabytes
	logger: process.env.NODE_ENV !== "production",

	onConnect: Connection.init,
	onMailFrom: MailFrom.init,
});

smtpServer.listen(25, () => {
	console.log("Inbound SMTP Server is listening on port 25");
});
