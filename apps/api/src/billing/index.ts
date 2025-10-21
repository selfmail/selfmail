import { Checkout, Webhooks } from "@polar-sh/elysia";
import Elysia from "elysia";

export const billing = new Elysia({
	prefix: "/billing",
	detail: {
		description: "Internal billing related endpoints, not for the public.",
	},
})
	.post(
		"/polar/webhooks",
		Webhooks({
			webhookSecret: process.env.POLAR_WEBHOOK_SECRET || "",
			onPayload: async (payload) => {},
		}),
	)
	.get(
		"/checkout",
		Checkout({
			accessToken: process.env.POLAR_ACCESS_TOKEN || "",
			successUrl: process.env.SUCCESS_URL,
			server: process.env.NODE_ENV === "development" ? "sandbox" : "production",
			theme: "light", // enforces light theme to match our dashboard
		}),
	);
