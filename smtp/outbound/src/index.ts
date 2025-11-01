import { SMTPServer } from "smtp-server";
import { Auth } from "./handler/auth";
import { Connect } from "./handler/connect";
import { MailFrom } from "./handler/mail-from";

const outboundServer = new SMTPServer({
	secure: false,
	authOptional: false,
	allowInsecureAuth: false,

	name: "Selfmail Outbound Server",

	onConnect: Connect.init,
	onAuth: Auth.init,
	onMailFrom: MailFrom.init,
});

outboundServer.listen(587, () => {
	console.log("Outbound SMTP server is listening on port 587");
});
