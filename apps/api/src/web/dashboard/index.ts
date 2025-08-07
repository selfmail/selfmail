import Elysia from "elysia";
import { requireAuthentication } from "../authentication";
import { requirePermissions } from "../permissions";
import { DashboardModule } from "./module";
import { DashboardService } from "./service";

export const dashboard = new Elysia({
	prefix: "/dashboard",
	detail: {
		description: "Dashboard endpoints for authenticated users.",
	},
})
	.use(requireAuthentication)
	.use(requirePermissions)
	.get(
		"/emails",
		async ({ query, user }) => {
			return await DashboardService.multipleEmails(query, user.id);
		},
		{
			query: DashboardModule.multipleEmailsQuery,
			detail: {
				description: "Get multiple emails for the authenticated user",
			},
			isSignIn: true,
		},
	)
	.get(
		"/emails/:id",
		async ({ params, user }) => {
			return await DashboardService.singleEmail(params, user.id);
		},
		{
			params: DashboardModule.singleEmailParams,
			detail: {
				description: "Get a single email by ID for the authenticated user",
			},
		},
	);
