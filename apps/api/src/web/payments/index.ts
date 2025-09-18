import Elysia from "elysia";
import { requirePermissions } from "../permissions";
import { PaymentsModule } from "./module";
import { PaymentsService } from "./service";

export const payments = new Elysia({
	detail: {
		description: "Payments endpoints for authenticated users.",
	},
	name: "service/payments",
	prefix: "/payments",
})
	.post("/webhooks", async () => PaymentsService.webhooks(), {
		detail: {
			description: "Handle webhooks from the payment provider.",
		},
	})
	.use(requirePermissions)
	.get(
		"/customer-portal",
		async ({ params }) => PaymentsService.customerPortal(params),
		{
			detail: {
				description:
					"Redirect to the customer portal for managing subscriptions and payments.",
			},
			params: PaymentsModule.customerPortalParams,
			permissions: ["payments:manage"],
		},
	)
	.get(
		"authenticate",
		async () => {
			return { authenticated: true };
		},
		{
			permissions: ["payments:manage"],
		},
	)
	.get("/checkout", async ({ params }) => PaymentsService.checkout(params), {
		detail: {
			description: "Redirect to the checkout page for creating a new payment.",
		},
		params: PaymentsModule.checkoutParams,
		permissions: ["payments:create"],
	})
	.get(
		"/currentPlan",
		async ({ query }) => await PaymentsService.getCurrentPlan(query),
		{
			detail: {
				description: "Get the current plan for a workspace.",
			},
			query: PaymentsModule.getCurrentPlanQuery,
			permissions: ["payments:manage"],
		},
	);
