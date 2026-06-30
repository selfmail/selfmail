import crypto from "node:crypto";
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
        userId: true,
        createdAt: true,
      },
    });

    return {
      members: members.map((member) => ({
        ...member,
        isCurrentMember: member.id === currentMember.id,
      })),
      canRemoveMembers: removeMembers.includes("members:remove"),
      canInviteMembers: removeMembers.includes("members:invite"),
    };
  });

export const removeMember = createServerFn({ method: "POST" })
  .validator(
    z.object({
      memberId: z.string(),
      workspaceId: z.string(),

      removeMemberId: z.string(),
    })
  )
  .middleware([authMiddleware])
  .handler(
    async ({
      context: { user },
      data: { memberId, workspaceId, removeMemberId },
    }) => {
      // Check whether memberId matches userid
      const currentMember = await db.member.findUnique({
        where: {
          id: memberId,
          workspaceId,
          userId: user.id,
        },
      });

      if (!currentMember) {
        throw new Response("Workspace not found", { status: 404 });
      }

      // Check whether the current member has permission to remove members
      const removeMembers = await permissions({
        memberId: currentMember.id,
        workspaceId,
        permissions: ["members:remove"],
      });

      if (!removeMembers.includes("members:remove")) {
        throw new Response("Forbidden", { status: 403 });
      }

      // Check whether the member to be removed exists in the workspace
      const memberToRemove = await db.member.findUnique({
        where: {
          id: removeMemberId,
          workspaceId,
        },
      });

      if (!memberToRemove) {
        throw new Response("Member not found", { status: 404 });
      }

      // Remove the member from the workspace
      await db.member.delete({
        where: {
          id: removeMemberId,
        },
      });

      return { success: true };
    }
  );

export const inviteMember = createServerFn({ method: "POST" })
  .validator(
    z.object({
      memberId: z.string(),
      workspaceId: z.string(),

      email: z.email(),
      message: z.string().optional(),
    })
  )
  .middleware([authMiddleware])
  .handler(
    async ({
      context: { user },
      data: { memberId, workspaceId, email, message },
    }) => {
      // Check whether memberId matches userid
      const currentMember = await db.member.findUnique({
        where: {
          id: memberId,
          workspaceId,
          userId: user.id,
        },
      });

      if (!currentMember) {
        throw new Error("Workspace not found");
      }

      // Check whether the current member has permission to invite members
      const inviteMembers = await permissions({
        memberId: currentMember.id,
        workspaceId,
        permissions: ["members:invite"],
      });

      if (!inviteMembers.includes("members:invite")) {
        throw new Error("Forbidden");
      }

      const token = crypto.randomBytes(32).toString("base64url");
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      // Create an invitation for the member
      await db.invitation.create({
        data: {
          email,
          token: hashedToken,
          invitedById: currentMember.id,
          workspaceId,
        },
      });

      if (process.env.NODE_ENV === "development") {
        console.log(`Invitation token for ${email}: ${token}`);
      }
      return { success: true };
    }
  );
