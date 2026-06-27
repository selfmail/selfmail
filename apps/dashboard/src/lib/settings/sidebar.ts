import { db } from "@selfmail/db";
import { permissions } from "@selfmail/permissions";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "#/utils/auth";

export const getSidebarPermissions = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      memberId: z.string(),
      workspaceId: z.string(),
    })
  )
  .handler(async ({ data: { memberId, workspaceId }, context: { user } }) => {
    // Check whether ids match the user
    const member = await db.member.findUnique({
      where: {
        userId: user.id,
        workspaceId,
        id: memberId,
      },
    });

    if (!member) {
      throw new Error("Member not found or does not belong to the user");
    }

    const p = await permissions({
      memberId: member.id,
      workspaceId,
      permissions: ["billings:view", "audit_logs:view", "permissions:update"],
    });

    return {
      canViewBilling: p.includes("billings:view"),
      canViewAuditLogs: p.includes("audit_logs:view"),
      canUpdatePermissions: p.includes("permissions:update"),
    };
  });
