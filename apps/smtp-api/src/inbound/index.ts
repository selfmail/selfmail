import Elysia from "elysia";
import { InboundModule } from "./module";
import { InboundService } from "./service";

export const inboundSmtp = new Elysia({
	prefix: "/inbound",
	name: "inbound",
	detail: {
		tags: ["Inbound"],
		description: "Handles inbound SMTP requests",
	},
})
	.post(
		"/connection",
		async ({ body }) => {
			return await InboundService.handleConnection({
				hostname: body.hostname,
				ip: body.ip,
			});
		},
		{
			body: InboundModule.connectionBody,
		},
	)
	.post(
		"/mail-from",
		async ({ body }) => {
			return await InboundService.handleMailFrom({
				from: body.from,
			});
		},
		{
			body: InboundModule.mailFromBody,
		},
	)
	.post(
		"/rcpt-to",
		async ({ body }) => {
			return await InboundService.handleRcptTo({
				to: body.to,
				mailFrom: body.mailFrom,
			});
		},
		{
			body: InboundModule.rcptToBody,
		},
	)
	.post(
		"/data",
		async ({ body }) => {
			return await InboundService.handleData({
				attachments: body.attachments,
				mailFrom: body.mailFrom,
				to: body.to,
				subject: body.subject,
				text: body.text,
				html: body.html,
			});
		},
		{
			body: InboundModule.dataBody,
		},
	)
	.post(
		"/spam",
		async ({ body }) => {
			return await InboundService.spam({
				body: body.body,
				subject: body.subject,
				html: body.html,
				from: body.from,
				to: body.to,
				attachments: body.attachments,
			});
		},
		{
			body: InboundModule.spamBody,
		},
	);
