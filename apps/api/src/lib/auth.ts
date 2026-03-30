import { db } from "database";

const hashToken = async (value: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );

  return Array.from(new Uint8Array(digest), (part) =>
    part.toString(16).padStart(2, "0")
  ).join("");
};

export const middlewareAuthentication = async (
  sessionToken: string | undefined
) => {
  try {
    if (!sessionToken) {
      return {
        authenticated: false,
      };
    }

    const sessionTokenHash = await hashToken(sessionToken);

    const session = await db.session.findUnique({
      where: {
        sessionToken: sessionTokenHash,
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
          sessionToken: sessionTokenHash,
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
