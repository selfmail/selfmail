import { verifyKey } from "@unkey/api";
import Elysia from "elysia";
import { SMTPOutgoingModule } from "./module";
import { SMTPOutgoingService } from "./service";

export const outgoingSmtp = new Elysia({
	prefix: "/smtp-outgoing",
	name: "smtp-outgoing",
	detail: {
		tags: ["Outgoing SMTP"],
		description:
			"Routes for the outgoing smtp service. This handles the Permissions to send emails via SMTP. It's not responsible for the relay server, just for the outgoing smtp connection.",
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
			return await SMTPOutgoingService.handleConnection(body);
		},
		{
			body: SMTPOutgoingModule.ConnectionBody,
			description:
				'Handle a connection to the SMTP server. You need to past the "hostname" and the "ip" of the server that\'s connecting.',
		},
	)
	.post(
		"/authentication",
		async ({ body }) => {
			return await SMTPOutgoingService.handleAuthentication(body);
		},
		{
			body: SMTPOutgoingModule.AuthenticationBody,
			description:
				"Handle the authentication of the SMTP server. You need to pass the username and password for the SMTP server.",
		},
	)
	.post(
		"/mail-from",
		async ({ body }) => {
			return await SMTPOutgoingService.handleMailFrom(body);
		},
		{
			body: SMTPOutgoingModule.MailFromBody,
			description:
				"Handle the MAIL FROM command of the SMTP server. You need to pass the email address of the sender.",
		},
	);
