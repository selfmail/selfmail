import { t } from "elysia";

export namespace PaymentsModule {
	// checkout
	export const checkoutParams = t.Object({
		workspaceId: t.String({
			description:
				"The ID of the workspace for which the payment is being created.",
			format: "uuid",
		}),
		product: t.Enum(
			{
				"selfmail-plus": "selfmail-plus",
				"selfmail-premium": "selfmail-premium",
			},
			{
				description: "The product for which the payment is being created.",
			},
		),
		userId: t.String({
			description: "The ID of the user making the payment.",
		}),
	});
	export type CheckoutParams = typeof checkoutParams.static;

	// customer portal
	export const customerPortalParams = t.Object({
		workspaceId: t.String({
			description: "The ID of the workspace to manage.",
			format: "uuid",
		}),
		userId: t.String({
			description: "The ID of the user accessing the customer portal.",
		}),
	});
	export type CustomerPortalParams = typeof customerPortalParams.static;

	export const getCurrentPlanQuery = t.Object({
		workspaceId: t.String({
			description: "The ID of the workspace to get the current plan for.",
			format: "uuid",
		}),
	});
	export type getCurrentPlanQuery = typeof getCurrentPlanQuery.static;
}
