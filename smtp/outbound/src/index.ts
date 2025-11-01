import { SMTPServer } from "smtp-server";
import { Connect } from "./handler/connect";

const outboundServer = new SMTPServer({
	secure: false,
	authOptional: false,
	allowInsecureAuth: false,

	name: "Selfmail Outbound Server",

	onConnect: Connect.init,
});
