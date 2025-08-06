import { t } from "elysia";

export namespace PaymentsModule {
	// checkout

	// customer portal
	export const customerPortalBody = t.Object({
		workspaceId: t.String({
			description: "The ID of the workspace to manage.",
			format: "uuid",
		}),
		userId: t.String({
			description: "The ID of the user accessing the customer portal.",
		}),
	});
	export type CustomerPortalBody = typeof customerPortalBody.static;
}
