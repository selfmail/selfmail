import Elysia from "elysia";
import { OutboundModule } from "./module";
import { OutboundService } from "./service";

export const outboundSmtp = new Elysia({
	prefix: "/outbound",
	name: "outbound",
	detail: {
		tags: ["Outbound"],
		description: "Api Routes for the outbound smtp server.",
	},
})
	.post(
		"/connection",
		async ({ body }) => {
			return await OutboundService.handleConnection(body);
		},
		{
			body: OutboundModule.ConnectionBody,
			description:
				'Handle a connection to the SMTP server. You need to past the "hostname" and the "ip" of the server that\'s connecting.',
		},
	)
	.post(
		"/authentication",
		async ({ body }) => {
			return await OutboundService.handleAuthentication(body);
		},
		{
			body: OutboundModule.AuthenticationBody,
			description:
				"Handle the authentication of the SMTP server. You need to pass the username and password for the SMTP server.",
		},
	)
	.post(
		"/mail-from",
		async ({ body }) => {
			return await OutboundService.handleMailFrom(body);
		},
		{
			body: OutboundModule.MailFromBody,
			description:
				"Handle the MAIL FROM command of the SMTP server. You need to pass the email address of the sender.",
		},
	)
	.post(
		"/rcpt-to",
		async ({ body }) => {
			return await OutboundService.handleRcptTo(body);
		},
		{
			body: OutboundModule.RcptToBody,
			description:
				"Handle the RCPT TO command of the SMTP server. You need to pass the email address of the recipient.",
		},
	)
	.post(
		"/data",
		async ({ body }) => {
			return await OutboundService.handleData(body);
		},
		{
			body: OutboundModule.DataBody,
			description:
				"Handle the DATA command of the SMTP server. You need to pass the email data.",
		},
	);
