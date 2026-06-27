import { db } from "@selfmail/db";
import { permissions } from "@selfmail/permissions";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "#/utils/auth";

export const getWorkspaceInformations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      workspaceId: z.string(),
      memberId: z.string(),
    })
  )
  .handler(async ({ context: { user }, data: { workspaceId, memberId } }) => {
    // Check whether memberId is matching the user id
    const member = await db.member.findUnique({
      where: {
        id: memberId,
        workspaceId,
        userId: user.id,
      },
      select: {
        image: true,
        profileName: true,
        createdAt: true,
        workspace: {
          select: {
            name: true,
            image: true,
            createdAt: true,
            description: true,
            id: true,
          },
        },
      },
    });

    if (!member) {
      throw new Error("Member not found");
    }

    const p = await permissions({
      memberId,
      workspaceId,
      permissions: ["workspace:update", "workspace:delete"],
    });

    return {
      canUpdateWorkspace: p.includes("workspace:update"),
      canDeleteWorkspace: p.includes("workspace:delete"),
      member: {
        profileName: member.profileName,
        image: member.image,
        createdAt: member.createdAt,
      },
      workspace: {
        name: member.workspace.name,
        image: member.workspace.image,
        createdAt: member.workspace.createdAt,
        description: member.workspace.description,
        id: member.workspace.id,
      },
    };
  });
