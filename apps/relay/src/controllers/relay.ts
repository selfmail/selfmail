import { Elysia } from "elysia";
import { RelayModule } from "../modules";
import { EmailRelayService } from "../services/relay";

export const relayController = new Elysia({
	prefix: "/relay",
	name: "relay-controller",
	detail: {
		tags: ["Email Relay"],
		description: "Email relay endpoints for processing and forwarding emails",
	},
})
	.model({
		"relay.email": RelayModule.EmailData,
		"relay.response": RelayModule.StandardResponse,
		"relay.target": RelayModule.RelayTargetResponse,
	})
	.post(
		"/",
		async ({ body }) => {
			try {
				const result = await EmailRelayService.processEmail(body);

				if (!result.success) {
					return {
						success: false,
						error: result.message,
						timestamp: new Date().toISOString(),
					};
				}

				return {
					success: true,
					message: result.message,
					relayTargets: result.relayTargets,
					timestamp: new Date().toISOString(),
				};
			} catch (error) {
				return {
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
					timestamp: new Date().toISOString(),
				};
			}
		},
		{
			body: "relay.email",
			response: {
				200: "relay.response",
				400: "relay.response",
				500: "relay.response",
			},
			detail: {
				summary: "Process email relay request",
				description:
					"Resolves MX records for recipient domains and returns relay targets for email delivery",
				tags: ["Email Relay"],
			},
		},
	);
