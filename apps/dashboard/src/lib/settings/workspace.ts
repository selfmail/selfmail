import { db } from "@selfmail/db";
import { permissions } from "@selfmail/permissions";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "#/utils/auth";

const updateWorkspaceSchema = z.object({
  workspaceId: z.string(),
  memberId: z.string(),
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(280).optional(),
  image: z.string().trim().max(750_000).optional(),
});

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

export const deleteWorkspace = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(
    z.object({
      workspaceId: z.string(),
      memberId: z.string(),
    })
  )
  .handler(async ({ data: { workspaceId, memberId }, context: { user } }) => {
    const member = await db.member.findUnique({
      where: {
        id: memberId,
        workspaceId,
        userId: user.id,
      },
    });

    if (!member) {
      throw new Error("Member not found");
    }

    // Check permissions
    const p = await permissions({
      memberId: member.id,
      workspaceId,
      permissions: ["workspace:delete"],
    });

    if (!p.includes("workspace:delete")) {
      throw new Error("You do not have permission to delete this workspace");
    }

    // remove any workspace related data
    await db.$transaction([
      db.domain.deleteMany({
        where: {
          workspaceId,
        },
      }),
      db.member.deleteMany({
        where: {
          workspaceId,
        },
      }),
      db.workspace.delete({
        where: {
          id: workspaceId,
        },
      }),
    ]);
    return { success: true };
  });

export const updateWorkspace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateWorkspaceSchema)
  .handler(
    async ({
      context: { user },
      data: { workspaceId, memberId, name, description, image },
    }) => {
      const member = await db.member.findUnique({
        where: {
          id: memberId,
          workspaceId,
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

      if (!member) {
        throw new Error("Member not found");
      }

      const p = await permissions({
        memberId: member.id,
        workspaceId,
        permissions: ["workspace:update"],
      });

      if (!p.includes("workspace:update")) {
        throw new Error("You do not have permission to update this workspace");
      }

      const workspace = await db.workspace.update({
        data: {
          description: description?.trim() || null,
          image: image?.trim() || null,
          name: name.trim(),
        },
        select: {
          name: true,
          image: true,
          createdAt: true,
          description: true,
          id: true,
        },
        where: {
          id: workspaceId,
        },
      });

      return {
        success: true,
        workspace,
      };
    }
  );
