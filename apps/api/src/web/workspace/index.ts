import Elysia, { t } from "elysia";
import { requireAuthentication } from "../authentication";
import { requirePermissions } from "../permissions";
import { WorkspaceService } from "./service";

export const workspace = new Elysia({
	prefix: "/workspace",
	name: "service/workspace",
	detail: {
		description: "Endpoints for workspace settings",
	},
})
	.use(requireAuthentication)
	.post(
		"/create",
		async ({ body, user }) => {
			return WorkspaceService.create({
				name: body.name,
				image: body.image,
				userId: user.id,
				username: user.name,
			});
		},
		{
			detail: {
				description: "Create a new workspace",
			},
			body: t.Object({
				image: t.Optional(
					t.File({
						type: "image",
						maxSize: 2 * 1024 * 1024, // 2 MB
						description:
							"Workspace avatar image. Maximal size for this image is 2mb.",
					}),
				),
				name: t.String({
					minLength: 1,
					maxLength: 100,
					description: "Name of the workspace",
				}),
			}),
		},
	)
	.get("/user", async ({ user }) => {
		return await WorkspaceService.user(user.id);
	})
	.use(requirePermissions)
	.post("/invite", async ({ body, user }) => {}, {
		permissions: ["workspace:invite"],
	})
	.post("/settings", async ({ body, user }) => {}, {
		permissions: ["workspace:edit"],
	})
	.post("/logo", async ({ body, user }) => {}, {
		permissions: ["workspace:edit"],
	})
	.post("/delete", async ({ body, user }) => {}, {
		permissions: ["workspace:delete"],
	})
	.post("/leave", async ({ body, user }) => {}, {
		permissions: ["workspace:leave"],
	})
	.post("/kick", async ({ body, user }) => {}, {
		permissions: ["workspace:kick"],
	})
	.get(
		"/:workspaceId/addresses",
		async ({ params, user }) => {
			return await WorkspaceService.getAddresses(params.workspaceId, user.id);
		},
		{
			params: t.Object({
				workspaceId: t.String({
					description: "The workspace ID",
				}),
			}),
			detail: {
				description: "Get available email addresses for the workspace",
			},
		},
	)
	.post(
		"/:workspaceId/send-email",
		async ({ params, body, user }) => {
			return await WorkspaceService.sendEmail(
				params.workspaceId,
				user.id,
				body,
			);
		},
		{
			params: t.Object({
				workspaceId: t.String({
					description: "The workspace ID",
				}),
			}),
			body: t.Object({
				from: t.String({
					description: "Sender email address",
				}),
				to: t.Array(t.String(), {
					description: "Recipient email addresses",
				}),
				cc: t.Optional(
					t.Array(t.String(), {
						description: "CC email addresses",
					}),
				),
				bcc: t.Optional(
					t.Array(t.String(), {
						description: "BCC email addresses",
					}),
				),
				subject: t.String({
					description: "Email subject",
				}),
				text: t.String({
					description: "Plain text email body",
				}),
				html: t.Optional(
					t.String({
						description: "HTML email body",
					}),
				),
				workspaceId: t.String({
					description: "Workspace ID",
				}),
			}),
			detail: {
				description: "Send an email through the relay service",
			},
		},
	);
