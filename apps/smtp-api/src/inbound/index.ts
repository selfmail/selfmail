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
	.get(
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
	.get(
		"/mail-from",
		async ({ body }) => {
			return await InboundService.handleMailFrom({
				address: body.address,
				size: body.size,
			});
		},
		{
			body: InboundModule.mailFromBody,
		},
	);
