import { component$ } from "@builder.io/qwik";
import { routeLoader$, server$, useNavigate } from "@builder.io/qwik-city";
import { init } from "@paralleldrive/cuid2";
import { db } from "database";
import { toast } from "qwik-sonner";
import { Button } from "~/components/ui/Button";
import { middlewareAuthentication } from "~/lib/auth";

const useInvitationInformations = routeLoader$(
  async ({ params, error, query }) => {
    const workspaceSlug = params.workspaceSlug;
    const invitationToken = query.get("token") || null;

    if (!(workspaceSlug && invitationToken)) {
      throw error(400, "Invalid invitation link");
    }

    const workspace = await db.workspace.findUnique({
      where: {
        slug: workspaceSlug,
      },
    });

    if (!(workspace && workspace.id)) {
      throw error(404, "Workspace not found");
    }

    const invitation = await db.invitation.findUnique({
      where: {
        token: invitationToken,
        workspaceId: workspace.id,
      },
      include: {
        invitedBy: true,
      },
    });

    if (!(invitation && invitation.id)) {
      throw error(404, "Invitation not found or invalid");
    }

    return {
      workspace: {
        name: workspace.name,
        image: workspace.image,
        slug: workspace.slug,
      },
      invitation: {
        createdAt: invitation.createdAt,
        invitedBy: {
          name: invitation.invitedBy.profileName,
          email: invitation.invitedBy.image,
        },
        role: invitation.roleId
          ? (
              await db.role.findUnique({
                where: {
                  id: invitation.roleId,
                },
              })
            )?.name
          : invitation.inviteAsAdmin
            ? "Admin"
            : "Member",
      },
    };
  }
);

const acceptInvitation = server$(async function () {
  const workspaceSlug = this.params.workspaceSlug;
  const invitationToken = this.query.get("token") || null;

  if (!(workspaceSlug && invitationToken)) {
    throw new Error("Invalid invitation link");
  }

  const invitation = await db.invitation.findUnique({
    where: {
      token: invitationToken,
      workspace: {
        slug: workspaceSlug,
      },
    },
    include: {
      workspace: {
        select: {
          Member: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!invitation) {
    return {
      success: false,
      redirectToAuth: false,
      message: "Invitation not found or invalid.",
    };
  }

  // if there's no user currently logged in, we'll have to push the user to the registration/login page
  const sessionToken = this.cookie.get("sessionToken")?.value || null;

  const createUserToken = init({
    length: 8,
  });

  if (!sessionToken) {
    const token = createUserToken();

    await db.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        userToken: token,
      },
    });

    return {
      success: true,
      redirectToAuth: true,
      token,
    };
  }

  const { authenticated, user } = await middlewareAuthentication(sessionToken);

  if (!(authenticated && user)) {
    const token = createUserToken();

    await db.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        userToken: token,
      },
    });

    return {
      success: true,
      redirectToAuth: true,
      token,
    };
  }

  const existingMember = await db.member.findFirst({
    where: {
      userId: user.id,
      workspaceId: invitation.workspaceId,
    },
  });

  if (existingMember) {
    return {
      success: false,
      redirectToAuth: false,
      message:
        "You are already a member of this workspace. A user can't be twice in the same workspace.",
    };
  }

  // add user to the workspace members
  await db.member.create({
    data: {
      userId: user.id,
      workspaceId: invitation.workspaceId,
      profileName: user.name || user.email,
    },
  });

  return {
    success: true,
    message: undefined,
    token: undefined,
    redirectToAuth: false,
  };
});

export default component$(() => {
  const invitation = useInvitationInformations();
  const navigate = useNavigate();
  return (
    <div class="flex min-h-screen w-full flex-col items-center justify-center space-y-3 bg-neutral-50">
      <h1 class="font-medium text-2xl">Join Workspace</h1>
      <div class="mx-5 flex max-w-md flex-col space-y-3 rounded-xl border border-neutral-200 bg-white p-6">
        {invitation.value.workspace.image && (
          <div class="flex w-full items-center justify-center">
            <img
              alt={invitation.value.workspace.name}
              class="h-12 w-12 rounded-full"
              src={invitation.value.workspace.image}
            />
          </div>
        )}
        <p>
          You have been invited to join the workspace{" "}
          <b>{invitation.value.workspace.name}</b> as a{" "}
          <b>{invitation.value.invitation.role}</b> by{" "}
          <b>{invitation.value.invitation.invitedBy.name}</b>.
        </p>
        <p class="text-neutral-500 text-sm">
          Invitation sent on{" "}
          {new Date(invitation.value.invitation.createdAt).toLocaleDateString()}
        </p>
      </div>
      <Button
        onClick$={async () => {
          const res = await acceptInvitation();

          if (res.success) {
            if (res.redirectToAuth && res.token) {
              throw navigate(
                `/auth/login?invitationToken=${res.token}&workspaceSlug=${invitation.value.workspace.name}`
              );
            }

            throw navigate(`/workspace/${invitation.value.workspace.slug}`);
          }
          toast.error(res.message || "An error occurred. Try again later.");
        }}
      >
        Accept Invitation
      </Button>
      <span class="cursor-pointer text-neutral-500 text-sm">
        Decline Invitation
      </span>
    </div>
  );
});
