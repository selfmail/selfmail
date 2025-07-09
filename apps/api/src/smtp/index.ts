import { verifyKey } from "@unkey/api";
import Elysia from "elysia";
import { SMTPModule } from "./module";
import { SMTPService } from "./service";

export const smtp = new Elysia({
	prefix: "/smtp",
	name: "smtp",
	detail: {
		tags: ["Smtp"],
		description:
			"The plugin for the communication with the SMTP server. The smtp server will hit the API for verifivying users, saving and sending emails and more.",
	},
})
	.derive(
		{ as: "global" },
		// copied over from the @elysiajs/bearer plugin, because the type
		// checking did not work with the derive function
		function deriveBearer({ headers: { authorization } }) {
			return {
				get bearer(): string | undefined {
					console.log("Extracting bearer token from headers:", authorization);
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
			return await SMTPService.handleConnection(body);
		},
		{
			body: SMTPModule.ConnectionBody,
			description:
				'Handle a connection to the SMTP server. You need to past the "hostname" and the "ip" of the server that\'s connecting.',
		},
	)
	.post(
		"/authentication",
		async ({ body }) => {
			return await SMTPService.handleAuthentication(body);
		},
		{
			body: SMTPModule.AuthenticationBody,
			description:
				"Handle the authentication of the SMTP server. You need to pass the username and password for the SMTP server.",
		},
	);
