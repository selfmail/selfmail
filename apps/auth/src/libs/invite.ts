import { Authentication } from "@selfmail/authentication";
import { db } from "@selfmail/db";
import { permissionNames } from "@selfmail/permissions";
import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { z } from "zod";

const auth = new Authentication({ identifier: "invite" });

const inviteTokenSchema = z.object({
  token: z.string().trim().min(1).max(256),
});

type InviteUser = Awaited<ReturnType<typeof getCurrentUser>>;

type InviteWorkspace = {
  description: string | null;
  id: string;
  image: string | null;
  name: string;
  slug: string;
};

type InviteMember = {
  name: string;
};

type InviteDetails = {
  email: string;
  invitedBy: InviteMember;
  roleName: string | null;
  status: "ACCEPTED" | "DECLINED" | "PENDING";
  workspace: InviteWorkspace;
};

export type InviteLookupResult =
  | {
      invite: InviteDetails;
      status: "success";
      user: NonNullable<InviteUser>;
    }
  | {
      loginRequired: true;
      status: "unauthenticated";
    }
  | {
      error: string;
      status: "error";
      user: NonNullable<InviteUser> | null;
    };

export type InviteActionResult =
  | {
      status: "success";
      workspaceSlug: string;
    }
  | {
      error: string;
      status: "error";
    }
  | {
      status: "unauthenticated";
    };

async function getCurrentUser() {
  const cookie = getCookie(auth.COOKIE_NAME);

  if (!cookie) {
    return null;
  }

  return auth.getCurrentUser({ token: cookie });
}

const toInviteDetails = (invitation: {
  email: string;
  invitedBy: {
    profileName: string;
  };
  role: {
    name: string;
  } | null;
  status: "ACCEPTED" | "DECLINED" | "PENDING";
  workspace: InviteWorkspace;
}): InviteDetails => ({
  email: invitation.email,
  invitedBy: {
    name: invitation.invitedBy.profileName,
  },
  roleName: invitation.role?.name ?? null,
  status: invitation.status,
  workspace: invitation.workspace,
});

const getInvitationByToken = (token: string) =>
  db.invitation.findUnique({
    select: {
      email: true,
      id: true,
      inviteAsAdmin: true,
      invitedBy: {
        select: {
          profileName: true,
        },
      },
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      roleId: true,
      status: true,
      workspace: {
        select: {
          description: true,
          id: true,
          image: true,
          name: true,
          slug: true,
        },
      },
      workspaceId: true,
    },
    where: {
      token,
    },
  });

const canUseInvitation = (inviteEmail: string, userEmail: string) =>
  inviteEmail.trim().toLowerCase() === userEmail.trim().toLowerCase();

export const getInviteFn = createServerFn({ method: "GET" })
  .inputValidator(inviteTokenSchema)
  .handler(async ({ data: { token } }): Promise<InviteLookupResult> => {
    const user = await getCurrentUser();

    if (!user) {
      return {
        loginRequired: true,
        status: "unauthenticated",
      };
    }

    const invitation = await getInvitationByToken(token);

    if (!invitation) {
      return {
        error: "This invitation could not be found.",
        status: "error",
        user,
      };
    }

    if (!canUseInvitation(invitation.email, user.email)) {
      return {
        error: `This invitation was sent to ${invitation.email}. Sign in with that email address to accept it.`,
        status: "error",
        user,
      };
    }

    return {
      invite: toInviteDetails(invitation),
      status: "success",
      user,
    };
  });

export const acceptInviteFn = createServerFn({ method: "POST" })
  .inputValidator(inviteTokenSchema)
  .handler(async ({ data: { token } }): Promise<InviteActionResult> => {
    const user = await getCurrentUser();

    if (!user) {
      return {
        status: "unauthenticated",
      };
    }

    const invitation = await getInvitationByToken(token);

    if (!invitation) {
      return {
        error: "This invitation could not be found.",
        status: "error",
      };
    }

    if (invitation.status !== "PENDING") {
      return {
        error: "This invitation has already been answered.",
        status: "error",
      };
    }

    if (!canUseInvitation(invitation.email, user.email)) {
      return {
        error: `This invitation was sent to ${invitation.email}. Sign in with that email address to accept it.`,
        status: "error",
      };
    }

    await db.$transaction(async (tx) => {
      const member =
        (await tx.member.findUnique({
          select: {
            id: true,
          },
          where: {
            userWorkspaceId: {
              userId: user.id,
              workspaceId: invitation.workspaceId,
            },
          },
        })) ??
        (await tx.member.create({
          data: {
            profileName: user.name ?? user.email,
            roles: invitation.roleId
              ? {
                  connect: {
                    id: invitation.roleId,
                  },
                }
              : undefined,
            userId: user.id,
            workspaceId: invitation.workspaceId,
          },
          select: {
            id: true,
          },
        }));

      if (invitation.inviteAsAdmin) {
        await tx.memberPermission.createMany({
          data: permissionNames.map((permissionName) => ({
            memberId: member.id,
            permissionName,
          })),
          skipDuplicates: true,
        });
      }

      await tx.invitation.update({
        data: {
          respondedAt: new Date(),
          status: "ACCEPTED",
          userId: user.id,
        },
        where: {
          id: invitation.id,
        },
      });
    });

    return {
      status: "success",
      workspaceSlug: invitation.workspace.slug,
    };
  });

export const declineInviteFn = createServerFn({ method: "POST" })
  .inputValidator(inviteTokenSchema)
  .handler(async ({ data: { token } }): Promise<InviteActionResult> => {
    const user = await getCurrentUser();

    if (!user) {
      return {
        status: "unauthenticated",
      };
    }

    const invitation = await getInvitationByToken(token);

    if (!invitation) {
      return {
        error: "This invitation could not be found.",
        status: "error",
      };
    }

    if (!canUseInvitation(invitation.email, user.email)) {
      return {
        error: `This invitation was sent to ${invitation.email}. Sign in with that email address to decline it.`,
        status: "error",
      };
    }

    await db.invitation.update({
      data: {
        respondedAt: new Date(),
        status: "DECLINED",
        userId: user.id,
      },
      where: {
        id: invitation.id,
      },
    });

    return {
      status: "success",
      workspaceSlug: invitation.workspace.slug,
    };
  });
