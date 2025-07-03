import { SMTPServer } from "smtp-server";

export const inboundServer = new SMTPServer();

export const outbundServer = new SMTPServer();

inboundServer.listen(25, () => {
	console.log("Inbound SMTP server listening on port 25");
});
outbundServer.listen(587, () => {
	console.log("Outbound SMTP server listening on port 587");
});
