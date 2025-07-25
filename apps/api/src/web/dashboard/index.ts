import Elysia from "elysia";
import { DashboardModule } from "./module";
import { DashboardService } from "./service";

export const dashboard = new Elysia({
	prefix: "/dashboard",
	detail: {
		description: "Dashboard endpoints for user registration and login.",
	},
})
	.get(
		"/emails",
		async ({ query }) => {
			return await DashboardService.multipleEmails(query);
		},
		{
			query: DashboardModule.multipleEmailsQuery,
		},
	)
	.get(
		"/emails/:id",
		async ({ params }) => {
			return await DashboardService.singleEmail(params);
		},
		{
			params: DashboardModule.singleEmailParams,
			detail: {
				description: "Get a single email by ID.",
			},
		},
	);
