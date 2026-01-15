import { db } from "database";

export const middlewareAuthentication = async (
  sessionToken: string | undefined
) => {
  try {
    if (!sessionToken) {
      return {
        authenticated: false,
      };
    }

    const session = await db.session.findFirst({
      where: {
        sessionToken,
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      return {
        authenticated: false,
      };
    }

    if (session.expires < new Date()) {
      await db.session.deleteMany({
        where: {
          sessionToken,
        },
      });

      return {
        authenticated: false,
      };
    }

    return {
      authenticated: true,
      user: session.user,
    };
  } catch (_) {
    return {
      authenticated: false,
    };
  }
};

export const verifyWorkspaceMembership = async (
  userId: string,
  workspaceSlug: string
) => {
  const workspace = await db.workspace.findUnique({
    where: {
      slug: workspaceSlug,
    },
  });

  if (!workspace) {
    return {
      isMember: false,
    };
  }

  const member = await db.member.findUnique({
    where: {
      userWorkspaceId: {
        userId,
        workspaceId: workspace.id,
      },
    },
    include: {
      MemberPermission: true,
    },
  });

  if (!member) {
    return {
      isMember: false,
    };
  }

  return {
    isMember: true,
    member,
    workspace,
  };
};
