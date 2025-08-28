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
			return await InboundService.handleConnection(body);
		},
		{
			body: InboundModule.connectionBody,
		},
	)
	.post(
		"/mail-from",
		async ({ body }) => {
			return await InboundService.handleMailFrom(body);
		},
		{
			body: InboundModule.mailFromBody,
		},
	)
	.post(
		"/rcpt-to",
		async ({ body }) => {
			return await InboundService.handleRcptTo(body);
		},
		{
			body: InboundModule.rcptToBody,
		},
	)
	.post(
		"/data",
		async ({ body }) => {
			console.log("Handle Data");
			return await InboundService.handleData(body);
		},
		{
			body: InboundModule.dataBody,
		},
	)
	.post(
		"/spam",
		async ({ body }) => {
			return await InboundService.spam(body);
		},
		{
			body: InboundModule.spamBody,
		},
	);
