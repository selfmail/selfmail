import Elysia from "elysia";
import { PaymentsModule } from "./module";
import { PaymentsService } from "./service";

export const payments = new Elysia({
	detail: {
		description: "Payments endpoints for authenticated users.",
	},
	prefix: "/payments",
})
	.get(
		"/customer-portal",
		async ({ params }) => PaymentsService.customerPortal(params),
		{
			detail: {
				description:
					"Redirect to the customer portal for managing subscriptions and payments.",
			},
			params: PaymentsModule.customerPortalParams,
		},
	)
	.get("/checkout", async ({ params }) => PaymentsService.checkout(params), {
		detail: {
			description: "Redirect to the checkout page for creating a new payment.",
		},
		params: PaymentsModule.checkoutParams,
	})
	.post("/webhooks", async (req) => PaymentsService.webhooks(), {
		detail: {
			description: "Handle webhooks from the payment provider.",
		},
	});
