import { SMTPServer } from "smtp-server";
import { Auth } from "./handler/auth";
import { Connect } from "./handler/connect";

const outboundServer = new SMTPServer({
	secure: false,
	authOptional: false,
	allowInsecureAuth: false,

	name: "Selfmail Outbound Server",

	onConnect: Connect.init,
	onAuth: Auth.init,
});

outboundServer.listen(587, () => {
	console.log("Outbound SMTP server is listening on port 587");
});
