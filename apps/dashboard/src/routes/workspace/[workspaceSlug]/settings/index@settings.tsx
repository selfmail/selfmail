import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import {
  Form,
  Link,
  routeAction$,
  routeLoader$,
  useLocation,
  z,
  zod$,
} from "@builder.io/qwik-city";
import { db } from "database";
import { toast } from "qwik-sonner";
import BackHeading from "~/components/ui/BackHeading";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { permissions } from "~/lib/permissions";
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

export default component$(() => {
  const workspaceData = useWorkspaceData();
  const updateAction = useUpdateWorkspace();
  const location = useLocation();

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
        <Link
          class="text-blue-500"
          href={`/workspace/${location.params.workspaceSlug}/settings/member`}
        >
          Manage Member
        </Link>
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
              <Button class="bg-red-600 hover:bg-red-700">
                Delete Workspace
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
});
