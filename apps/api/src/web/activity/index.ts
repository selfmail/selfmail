import Elysia, { t } from "elysia";
import { requireAuthentication } from "../authentication";
import { requirePermissions } from "../permissions";
import { ActivityService } from "./service";

export const activity = new Elysia({
	prefix: "/activity",
	name: "service/activity",
	detail: {
		description: "Endpoints for activity management",
	},
})
	.use(requireAuthentication)
	.use(requirePermissions)
	.get(
		"/many",
		async ({ query, user, set }) => {
			try {
				return await ActivityService.getActivities({
					workspaceId: query.workspaceId,
					userId: user.id,
					page: query.page || 1,
					limit: query.limit || 50,
					type: query.type,
					color: query.color,
					dateFrom: query.dateFrom,
					dateTo: query.dateTo,
				});
			} catch (error) {
				set.status = 500;
				return {
					error: true,
					message:
						error instanceof Error ? error.message : "Internal server error",
				};
			}
		},
		{
			query: t.Object({
				workspaceId: t.String({
					description: "The workspace ID",
				}),
				page: t.Optional(
					t.Number({
						minimum: 1,
						description: "Page number for pagination",
					}),
				),
				limit: t.Optional(
					t.Number({
						minimum: 1,
						maximum: 100,
						description: "Number of activities per page",
					}),
				),
				type: t.Optional(
					t.Union([t.String(), t.Array(t.String())], {
						description: "Filter by activity type",
					}),
				),
				color: t.Optional(
					t.Union([t.String(), t.Array(t.String())], {
						description: "Filter by activity color",
					}),
				),
				dateFrom: t.Optional(
					t.String({
						description: "Filter activities from this date (ISO string)",
					}),
				),
				dateTo: t.Optional(
					t.String({
						description: "Filter activities until this date (ISO string)",
					}),
				),
			}),
			detail: {
				description: "Get activities for a workspace",
			},
		},
	)
	.post(
		"/:workspaceId",
		async ({ params, body, user, set }) => {
			try {
				return await ActivityService.createActivity({
					workspaceId: params.workspaceId,
					userId: user.id,
					title: body.title,
					description: body.description,
					type: body.type,
					color: body.color,
				});
			} catch (error) {
				set.status = 500;
				return {
					error: true,
					message:
						error instanceof Error ? error.message : "Internal server error",
				};
			}
		},
		{
			params: t.Object({
				workspaceId: t.String({
					description: "The workspace ID",
				}),
			}),
			body: t.Object({
				title: t.String({
					minLength: 1,
					maxLength: 255,
					description: "Activity title",
				}),
				description: t.Optional(
					t.String({
						maxLength: 1000,
						description: "Activity description",
					}),
				),
				type: t.Optional(
					t.Union(
						[
							t.Literal("task"),
							t.Literal("note"),
							t.Literal("event"),
							t.Literal("reminder"),
						],
						{
							description: "Activity type",
							default: "event",
						},
					),
				),
				color: t.Optional(
					t.Union(
						[
							t.Literal("neutral"),
							t.Literal("positive"),
							t.Literal("negative"),
						],
						{
							description: "Activity color",
							default: "neutral",
						},
					),
				),
			}),
			detail: {
				description: "Create a new activity",
			},
		},
	);
