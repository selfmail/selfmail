import { db } from "database";
import Elysia, { status, t } from "elysia";
import z from "zod";

export const requirePermissions = new Elysia({
	name: "requirePermissions",
	detail: {
		description: "Middleware to check user permissions for specific actions.",
	},
})
	.guard({
		isSignIn: true,
		body: t.Object({
			workspaceId: t.String({
				description: "ID of the workspace to check permissions for",
			}),
		}),
	})
	.macro({
		permissions: (permissions: string[]) => ({
			async resolve({ user, body }) {
				const parse = await z
					.object({
						workspaceId: z
							.string()
							.describe("ID of the workspace to check permissions for"),
					})
					.safeParseAsync(body);

				if (!user || !parse.success)
					throw status(401, "Authentication required");

				const { workspaceId } = parse.data;

				// check if user is a member of the workspace and fetch member id
				const member = await db.member.findFirst({
					where: {
						userId: user.id,
						workspaceId: workspaceId,
					},
					select: {
						MemberPermission: {
							include: {
								permission: true,
							},
						},
						id: true,
					},
				});

				if (!member) throw status(403, "User is not a member of the workspace");

				// Check if user has all required permissions
				const userPermissions = member.MemberPermission.map(
					(mp) => mp.permission.name,
				);
				const missingPermissions = permissions.filter(
					(permission) => !userPermissions.includes(permission),
				);

				if (missingPermissions.length > 0) {
					throw status(
						403,
						`Missing permissions: ${missingPermissions.join(", ")}`,
					);
				}

				return { member };
			},
		}),
	})
	.as("global");
