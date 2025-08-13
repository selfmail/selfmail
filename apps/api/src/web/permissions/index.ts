import { db } from "database";
import Elysia, { status } from "elysia";
import { requireWorkspaceMember } from "../authentication";

export const requirePermissions = new Elysia({
	name: "requirePermissions",
	detail: {
		description: "Middleware to check user permissions for specific actions.",
	},
})
	.use(requireWorkspaceMember)
	.macro({
		permissions: (permissions?: string[]) => {
			if (!permissions) return;

			return {
				async beforeHandle({ user, workspace }) {
					if (!workspace || !user) throw status(401, "Authentication required");

					// check if user is a member of the workspace and fetch member id
					const member = await db.member.findFirst({
						where: {
							userId: user.id,
							workspaceId: workspace.id,
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

					if (!member)
						throw status(403, "User is not a member of the workspace");

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
				},
			};
		},
	})
	.as("scoped");

export const permissions = new Elysia({
	name: "service/permissions",
	prefix: "/permissions",
}).use(requirePermissions);
