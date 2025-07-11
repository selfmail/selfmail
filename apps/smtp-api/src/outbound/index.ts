import { verifyKey } from "@unkey/api";
import Elysia from "elysia";
import { OutboundModule } from "./module";
import { OutboundService } from "./service";

export const outgoingSmtp = new Elysia({
	prefix: "/smtp-outgoing",
	name: "smtp-outgoing",
	detail: {
		tags: ["Outgoing SMTP"],
	},
})
	.derive(
		{ as: "global" },
		// copied over from the @elysiajs/bearer plugin, because the type
		// checking did not work with the derive function
		function deriveBearer({ headers: { authorization } }) {
			return {
				get bearer(): string | undefined {
					if ((authorization as string)?.startsWith("Bearer "))
						return (authorization as string).slice(7);

					return undefined;
				},
			};
		},
	)
	.macro({
		isSignedIn(enabled: boolean) {
			if (!enabled) {
				return;
			}
			return {
				async beforeHandle({ bearer, status }) {
					if (!bearer) {
						return status(401);
					}

					const { result, error } = await verifyKey({
						apiId: process.env.UNKEY_API_ID ?? "",
						key: bearer,
					});

					if (error) {
						return status(401);
					}

					if (!result) {
						return status(401);
					}

					if (!result.roles?.includes("smtp-server")) {
						return status(403);
					}
				},
			};
		},
	})
	.guard({
		isSignedIn: true,
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
