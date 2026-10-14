import { db } from "@selfmail/db";
import { hasPermissions } from "@selfmail/permissions";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "#/utils/auth";
import { workspaceSlugSchema } from "./schemas";

export const getWorkspaceSetup = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.validator(workspaceSlugSchema)
	.handler(async ({ context: { user }, data: { workspaceSlug } }) => {
		const member = await db.member.findFirst({
			where: { userId: user.id, workspace: { slug: workspaceSlug } },
			select: { id: true, workspaceId: true },
		});

		if (
			!member ||
			!(await hasPermissions({
				memberId: member.id,
				workspaceId: member.workspaceId,
				permissions: ["workspace:update"],
			}))
		) {
			return null;
		}

		const [workspace, address] = await Promise.all([
			db.workspace.findUniqueOrThrow({
				where: { id: member.workspaceId },
				select: {
					description: true,
					Domain: { where: { verified: true }, select: { id: true }, take: 1 },
				},
			}),
			db.address.findFirst({
				where: {
					MemberAddress: {
						some: { member: { workspaceId: member.workspaceId } },
					},
				},
				select: { id: true },
			}),
		]);

		return {
			description: Boolean(workspace.description?.trim()),
			domain: workspace.Domain.length > 0,
			email: Boolean(address),
		};
	});
