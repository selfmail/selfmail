import Elysia, { status, t } from "elysia";
import { requireWorkspaceMember } from "../authentication";
import { DashboardModule } from "./module";
import { DashboardService } from "./service";

export const dashboard = new Elysia({
	prefix: "/dashboard",
	detail: {
		description: "Dashboard endpoints for authenticated users.",
	},
})
	.use(requireWorkspaceMember)
	.get(
		"/emails",
		async ({ query, member, workspace }) => {
			if (!member || !workspace) {
				throw status(401, "Authentication required");
			}
			return await DashboardService.multipleEmails(
				query,
				member.id,
				workspace.id,
			);
		},
		{
			query: DashboardModule.multipleEmailsQuery,
		},
	)
	.get(
		"/emails/:id",
		async ({ params, user }) => {
			if (!user) {
				throw status(401, "Authentication required");
			}
			return await DashboardService.singleEmail(params, user.id);
		},
		{
			params: DashboardModule.singleEmailParams,
			detail: {
				description: "Get a single email by ID for the authenticated user",
			},
		},
	)
	.get("/addresses", async ({ member }) => {
		return await DashboardService.userAddresses(member.id);
	})
	.patch(
		"/emails/:id/read",
		async ({ params, body, member, workspace }) => {
			if (!member || !workspace) {
				throw status(401, "Authentication required");
			}
			return await DashboardService.markEmailAsRead(
				params.id,
				body.read,
				member.id,
				workspace.id,
			);
		},
		{
			params: t.Object({
				id: t.String({
					description: "Email ID",
				}),
			}),
			body: t.Object({
				read: t.Boolean({
					description: "Whether the email should be marked as read",
				}),
			}),
			detail: {
				description: "Mark an email as read or unread",
			},
		},
	);
