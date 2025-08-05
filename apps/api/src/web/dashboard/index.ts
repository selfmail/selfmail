import Elysia from "elysia";
import {
	rateLimitMiddleware,
	sessionAuthMiddleware,
} from "../../lib/auth-middleware";
import { DashboardModule } from "./module";
import { DashboardService } from "./service";

export const dashboard = new Elysia({
	prefix: "/dashboard",
	detail: {
		description: "Dashboard endpoints for authenticated users.",
	},
})
	.derive(async ({ request, set }) => {
		// Rate limiting
		const identifier =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		const rateLimit = await rateLimitMiddleware(identifier, "dashboard");

		if (!rateLimit.success) {
			set.status = 429;
			throw new Error("Rate limit exceeded");
		}

		// Authentication
		const authUser = await sessionAuthMiddleware(
			Object.fromEntries(request.headers.entries()),
		);

		if (!authUser) {
			set.status = 401;
			throw new Error("Authentication required");
		}

		return { authUser, rateLimit };
	})
	.get(
		"/emails",
		async ({ query, authUser }) => {
			return await DashboardService.multipleEmails(query, authUser.id);
		},
		{
			query: DashboardModule.multipleEmailsQuery,
			detail: {
				description: "Get multiple emails for the authenticated user",
			},
		},
	)
	.get(
		"/emails/:id",
		async ({ params, authUser }) => {
			return await DashboardService.singleEmail(params, authUser.id);
		},
		{
			params: DashboardModule.singleEmailParams,
			detail: {
				description: "Get a single email by ID for the authenticated user",
			},
		},
	);
