import { $, component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import {
  Form,
  Link,
  routeAction$,
  routeLoader$,
  server$,
  useLocation,
  useNavigate,
  z,
  zod$,
} from "@builder.io/qwik-city";
import { db } from "database";
import { toast } from "qwik-sonner";
import AlertDialog from "~/components/ui/AlertDialog";
import BackHeading from "~/components/ui/BackHeading";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import {
  middlewareAuthentication,
  verifyWorkspaceMembership,
} from "~/lib/auth";
import { hasPermissions, permissions } from "~/lib/permissions";
import type { MemberInSharedMap, WorkspaceInSharedMap } from "../types";

const useWorkspaceData = routeLoader$(async ({ sharedMap, error }) => {
  const member = sharedMap.get("member") as MemberInSharedMap;
  const workspace = sharedMap.get("workspace") as WorkspaceInSharedMap;

  if (!member?.id) {
    throw error(403, "Forbidden");
  }

  if (!workspace?.id) {
    throw error(404, "Workspace not found");
  }

  const memberPermissions = await permissions({
    memberId: member.id,
    workspaceId: workspace.id,
    permissions: ["settings:update-workspace", "settings:delete"],
  });

  return {
    workspace: {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      image: workspace.image,
    },
    canUpdateWorkspace: memberPermissions.includes("settings:update-workspace"),
    canDeleteWorkspace: memberPermissions.includes("settings:delete"),
  };
});

export const useUpdateWorkspace = routeAction$(
  async ({ name, description }, { sharedMap, error }) => {
    const member = sharedMap.get("member") as MemberInSharedMap;
    const workspace = sharedMap.get("workspace") as WorkspaceInSharedMap;

    if (!member?.id) {
      throw error(403, "Forbidden");
    }

    if (!workspace?.id) {
      throw error(404, "Workspace not found");
    }

    // Check permissions
    const memberPermissions = await permissions({
      memberId: member.id,
      workspaceId: workspace.id,
      permissions: ["settings:update-workspace"],
    });

    if (!memberPermissions.includes("settings:update-workspace")) {
      return {
        fieldErrors: {
          general: "You do not have permission to update workspace settings",
        },
        failed: true,
      };
    }

    try {
      const updatedWorkspace = await db.workspace.update({
        where: {
          id: workspace.id,
        },
        data: {
          name,
          description: description || null,
        },
      });

      if (!updatedWorkspace) {
        return {
          fieldErrors: {
            general: "Failed to update workspace",
          },
          failed: true,
        };
      }

      return {
        fieldErrors: {},
        failed: false,
        success: true,
      };
    } catch (e) {
      console.error("Error updating workspace:", e);
      return {
        fieldErrors: {
          general: "Failed to update workspace. Please try again.",
        },
        failed: true,
      };
    }
  },
  zod$({
    name: z
      .string()
      .min(1, "Workspace name is required")
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must be at most 50 characters"),
    description: z
      .string()
      .max(200, "Description must be at most 200 characters")
      .optional(),
  })
);

const deleteWorkspace = server$(async function (workspaceId: string) {
  const parse = await z.string().min(8).max(9).safeParseAsync(workspaceId);
  if (!parse.success) {
    throw new Error("Invalid workspace ID");
  }

  let currentMember = this.sharedMap.get("member") as MemberInSharedMap;

  if (!currentMember) {
    const sessionToken = this.cookie.get("selfmail-session-token")?.value;
    const workspaceSlug = this.params.workspaceSlug;

    if (!(workspaceSlug && sessionToken)) {
      throw new Error("No workspace slug or session token provided.");
    }

    const { authenticated, user } =
      await middlewareAuthentication(sessionToken);

    if (!(authenticated && user)) {
      throw new Error("User is not authenticated. Please log in.");
    }

    const { isMember, member, workspace } = await verifyWorkspaceMembership(
      user.id,
      workspaceSlug
    );

    if (!(isMember && member && workspace)) {
      throw new Error("User is not a member of this workspace. Access denied.");
    }
    currentMember = member;
  }

  const userPermission = await hasPermissions({
    memberId: currentMember.id,
    workspaceId: currentMember.workspaceId,
    permissions: ["settings:delete"],
  });

  if (!userPermission) {
    return {
      success: false,
      message: "You do not have permission to delete this workspace.",
    };
  }

  try {
    await db.$transaction([
      db.address.deleteMany({
        where: {
          Domain: {
            workspaceId,
          },
        },
      }),
      db.domain.deleteMany({
        where: {
          workspaceId,
        },
      }),
      db.smtpCredentials.deleteMany({
        where: {
          workspaceId,
        },
      }),
      db.activity.deleteMany({
        where: {
          workspaceId,
        },
      }),
      db.invitation.deleteMany({
        where: {
          workspaceId,
        },
      }),
      db.member.deleteMany({
        where: {
          workspaceId,
        },
      }),
      db.role.deleteMany({
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
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete workspace",
    };
  }

  return {
    success: true,
  };
});

export default component$(() => {
  const workspaceData = useWorkspaceData();
  const updateAction = useUpdateWorkspace();
  const location = useLocation();
  const navigate = useNavigate();

  const fieldErrors = useStore({
    name: "",
    description: "",
    general: "",
  });

  useVisibleTask$(({ track }) => {
    track(() => updateAction.value);

    if (updateAction.value?.failed) {
      const errors = updateAction.value.fieldErrors as Record<string, string>;
      fieldErrors.name = errors.name || "";
      fieldErrors.description = errors.description || "";
      fieldErrors.general = errors.general || "";

      if (fieldErrors.general) {
        toast.error(fieldErrors.general);
      }
    }

    if (updateAction.value?.success) {
      toast.success("Workspace updated successfully!");
      // Clear any previous errors
      fieldErrors.name = "";
      fieldErrors.description = "";
      fieldErrors.general = "";
    }
  });

  if (!workspaceData.value.canUpdateWorkspace) {
    return (
      <>
        <div class="flex flex-row items-center justify-between">
          <BackHeading>Workspace Settings</BackHeading>
          <Link
            class="text-blue-500"
            href={`/workspace/${location.params.workspaceSlug}/settings/member`}
          >
            Manage Member
          </Link>
        </div>
        <div class="flex flex-col items-center justify-center rounded-lg border border-neutral-200 bg-white p-8 text-center">
          <h3 class="font-medium text-lg text-neutral-900">Access Denied</h3>
          <p class="mt-2 text-neutral-500 text-sm">
            You don't have permission to update workspace settings.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div class="flex flex-row items-center justify-between">
        <BackHeading>Workspace Settings</BackHeading>
        <div class="flex gap-4">
          <Link
            class="text-blue-500"
            href={`/workspace/${location.params.workspaceSlug}/settings/member`}
          >
            Manage Member
          </Link>
          <Link class="text-blue-500" href="/account">
            Account Settings
          </Link>
        </div>
      </div>

      <div class="flex flex-col space-y-6">
        <Form
          action={updateAction}
          class="flex flex-col space-y-4 rounded-lg border border-neutral-200 bg-white p-6"
        >
          <div class="flex flex-col space-y-2">
            <h3 class="font-medium text-lg text-neutral-900">
              General Settings
            </h3>
            <p class="text-neutral-500 text-sm">
              Update your workspace name and description.
            </p>
          </div>
          <div class="flex flex-col space-y-4">
            <div class="flex flex-col space-y-2">
              <label class="font-medium text-neutral-700 text-sm" for="name">
                Workspace Name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Enter workspace name"
                required
                value={workspaceData.value.workspace.name}
              />
              {fieldErrors.name && (
                <p class="text-red-600 text-sm">{fieldErrors.name}</p>
              )}
            </div>

            <div class="flex flex-col space-y-2">
              <label
                class="font-medium text-neutral-700 text-sm"
                for="description"
              >
                Description
              </label>
              <Input
                id="description"
                name="description"
                placeholder="Enter workspace description (optional)"
                value={workspaceData.value.workspace.description || ""}
              />
              {fieldErrors.description && (
                <p class="text-red-600 text-sm">{fieldErrors.description}</p>
              )}
            </div>
          </div>{" "}
          <div class="flex flex-row justify-end">
            <Button disabled={updateAction.isRunning} type="submit">
              {updateAction.isRunning ? "Updating..." : "Update Workspace"}
            </Button>
          </div>
        </Form>

        {workspaceData.value.canDeleteWorkspace && (
          <div class="rounded-lg border border-red-200 bg-red-50 p-6">
            <div class="flex flex-col space-y-2">
              <h3 class="font-medium text-lg text-red-900">Danger Zone</h3>
              <p class="text-red-700 text-sm">
                Once you delete a workspace, there is no going back. Please be
                certain.
              </p>
            </div>

            <div class="mt-4">
              <AlertDialog
                class="bg-red-600 hover:bg-red-700"
                description={`Are you sure you want to delete ${workspaceData.value.workspace.name}? This will permanently delete the workspace and all associated data including domains, email addresses, members, roles, and activities. This action cannot be undone.`}
                proceedAction={$(async () => {
                  const result = await deleteWorkspace(
                    workspaceData.value.workspace.id
                  );
                  if (result.success) {
                    toast.success("Workspace deleted successfully");
                    navigate("/");
                  } else {
                    toast.error(result.message || "Failed to delete workspace");
                  }
                })}
                proceedActionText="Delete Workspace"
                title="Delete Workspace?"
              >
                Delete Workspace
              </AlertDialog>
            </div>
          </div>
        )}
      </div>
    </>
  );
});
