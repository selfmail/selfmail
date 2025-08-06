import { Webhooks } from "@polar-sh/elysia";
import Elysia from "elysia";
import { PaymentsService } from "./service";

export const payments = new Elysia({
	detail: {
		description: "Payments endpoints for authenticated users.",
	},
	prefix: "/payments",
})
	.get("/customer-portal", async () => PaymentsService.customerPortal(), {
		detail: {
			description:
				"Redirect to the customer portal for managing subscriptions and payments.",
		},
	})
	.get("/checkout", async () => PaymentsService.checkout(), {
		detail: {
			description: "Redirect to the checkout page for creating a new payment.",
		},
	})
	.post("/webhooks", async (req) => PaymentsService.webhooks(), {
		detail: {
			description: "Handle webhooks from the payment provider.",
		},
	});
