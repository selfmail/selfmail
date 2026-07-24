import { db } from "@selfmail/db";
import { permissions } from "@selfmail/permissions";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "#/utils/auth";

export const getAuditLogs = createServerFn({ method: "GET" })
	.validator(
		z.object({
			memberId: z.string(),
		}),
	)
	.middleware([authMiddleware])
	.handler(async ({ data: { memberId }, context: { user } }) => {
		const member = await db.member.findUnique({
			where: {
				id: memberId,
				userId: user.id,
			},
		});

		if (!member) {
			throw new Error("Not logged in.");
		}

		const p = await permissions({
			memberId,
			workspaceId: member.workspaceId,
			permissions: ["audit_logs:view"],
		});

		if (!p.includes("audit_logs:view")) {
			throw new Error("Member has not permissions to view audit logs.");
		}

		const logs = await db.auditLog.findMany({
			orderBy: {
				createdAt: "desc",
			},
			where: {
				tenantId: member.workspaceId,
			},
		});

		return logs;
	});
