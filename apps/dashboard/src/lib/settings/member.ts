import { db } from "@selfmail/db";
import { permissions } from "@selfmail/permissions";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "#/utils/auth";

export const getMembers = createServerFn({ method: "GET" })
  .validator(
    z.object({
      memberId: z.string(),
      workspaceId: z.string(),
    })
  )
  .middleware([authMiddleware])
  .handler(async ({ context: { user }, data: { memberId, workspaceId } }) => {
    const currentMember = await db.member.findFirst({
      where: {
        id: memberId,
        userId: user.id,
        workspaceId,
      },
      select: {
        id: true,
      },
    });

    if (!currentMember) {
      throw new Response("Workspace not found", { status: 404 });
    }

    const removeMembers = await permissions({
      memberId: currentMember.id,
      workspaceId,
      permissions: ["members:remove", "members:invite"],
    });

    const members = await db.member.findMany({
      orderBy: {
        createdAt: "asc",
      },
      where: {
        workspaceId,
      },
      select: {
        profileName: true,
        id: true,
        createdAt: true,
      },
    });

    return {
      members,
      canRemoveMembers: removeMembers.includes("members:remove"),
      canInviteMembers: removeMembers.includes("members:invite"),
    };
  });
