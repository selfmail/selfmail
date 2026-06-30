import crypto from "node:crypto";
import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "./auth";
import { hashToken } from "./hash";

export const checkInviteToken = createServerFn({
  method: "GET",
})
  .validator(
    z.object({
      token: z.string().trim(),
    })
  )
  .handler(async ({ data: { token } }) => {
    // TODO: add ratelimiting
    const hash = hashToken(token);
    const invite = await db.invitation.findUnique({
      where: {
        token: hash,
      },
      select: {
        workspace: {
          select: {
            name: true,
          },
        },
        invitedBy: {
          select: {
            profileName: true,
          },
        },
      },
    });

    console.log(invite);

    return {
      valid: invite !== null,
      invitedBy: invite?.invitedBy.profileName,
      workspaceName: invite?.workspace.name,
    };
  });

export const acceptInvite = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      token: z.string().trim(),
    })
  )
  .middleware([authMiddleware])
  .handler(async ({ data: { token }, context: { user } }) => {
    const hash = hashToken(token);
    const invite = await db.invitation.findUnique({
      where: {
        token: hash,
      },
      select: {
        workspaceId: true,
        invitedById: true,
      },
    });

    if (!invite) {
      throw new Response("Invalid invite token", { status: 400 });
    }

    // Check whether the user is already a member of the workspace
    const existingMembership = await db.member.findUnique({
      where: {
        userWorkspaceId: {
          userId: user.id,
          workspaceId: invite.workspaceId,
        },
      },
    });

    if (existingMembership) {
      throw new Error("User is already a member of the workspace");
    }
    const randomMemberId = crypto.randomBytes(32).toString("base64url");

    await db.$transaction([
      db.member.create({
        data: {
          id: randomMemberId,
          workspaceId: invite.workspaceId,
          userId: user.id,
          profileName: user.name ?? user.email,
        },
      }),
      db.invitation.delete({
        where: {
          token: hash,
        },
      }),
    ]);
  });
