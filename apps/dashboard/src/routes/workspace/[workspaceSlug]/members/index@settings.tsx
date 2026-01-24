import { component$ } from "@builder.io/qwik";
import { Link, routeLoader$, server$ } from "@builder.io/qwik-city";
import { LuUserPlus } from "@qwikest/icons/lucide";
import { db } from "database";
import BackHeading from "~/components/ui/BackHeading";
import {
  middlewareAuthentication,
  verifyWorkspaceMembership,
} from "~/lib/auth";
import { permissions } from "~/lib/permissions";
import type { MemberInSharedMap, WorkspaceInSharedMap } from "../types";

const useMembers = routeLoader$(async ({ sharedMap, error }) => {
  const member = sharedMap.get("member") as MemberInSharedMap;

  if (!(member && member.id)) {
    throw error(404, "Member not found");
  }

  const workspace = sharedMap.get("workspace") as WorkspaceInSharedMap;

  if (!(workspace && workspace.id)) {
    throw error(404, "Workspace not found");
  }

  // check permissions, if the user don't have these permissions,
  // we will return that, so the frontend can hide the invite/remove buttons
  const memberPermissions = await permissions({
    memberId: member.id,
    permissions: ["members:remove", "members:invite"],
    workspaceId: workspace.id,
  });

  const members = await db.member.findMany({
    where: {
      workspaceId: workspace.id,
    },
  });

  return {
    members: members.filter((m) => m.id !== member.id),
    currentMember: member,
    canInviteMembers: memberPermissions.includes("members:invite"),
    canRemoveMembers: memberPermissions.includes("members:remove"),
  };
});

const kickMember = server$(async function (memberId: string) {
  // checking for user permissions
  const sessionToken = this.cookie.get("selfmail-session-token")?.value;
  const workspaceSlug = this.params.workspaceSlug;

  if (!(workspaceSlug && sessionToken)) {
    throw new Error("User not authenticated");
  }

  const { authenticated, user } = await middlewareAuthentication(sessionToken);

  if (!(authenticated && user)) {
    throw new Error("User not authenticated");
  }

  const { isMember, member, workspace } = await verifyWorkspaceMembership(
    user.id,
    workspaceSlug
  );

  if (!(isMember && member && workspace)) {
    throw new Error("User not authenticated");
  }

  // check permissions
  const memberPermissions = await permissions({
    memberId: member.id,
    permissions: ["members:remove"],
    workspaceId: workspace.id,
  });

  if (!memberPermissions.includes("members:remove")) {
    throw new Error("User not authorized to remove members");
  }

  await db.member.delete({
    where: {
      id: memberId,
      workspaceId: workspace.id,
      AND: {
        workspace: {
          ownerId: {
            not: memberId,
          },
        },
      },
    },
  });
});

export default component$(() => {
  const members = useMembers();
  return (
    <>
      <BackHeading>Members</BackHeading>
      <div class="flex flex-col space-y-3">
        <h2 class="font-medium text-lg">You</h2>
        <div class="flex w-full flex-row items-center justify-between rounded-md border border-neutral-200 bg-white p-4">
          Workspace Member since{" "}
          {new Date(members.value.currentMember.createdAt).toLocaleDateString(
            undefined,
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )}
          .
        </div>
      </div>
      <div class="flex flex-col space-y-3">
        <div class="flex w-full flex-row items-center justify-between">
          <h2 class="font-medium text-lg">Members of this workspace</h2>
          {members.value.canInviteMembers && (
            <Link
              class="flex items-center space-x-1 text-blue-500"
              href="invite"
            >
              <LuUserPlus class="h-4 w-4" />
              <span>Invite</span>
            </Link>
          )}
        </div>
        {members.value.members.length === 0 ? (
          <div class="flex w-full flex-col items-center justify-center rounded-lg border border-neutral-200 bg-white p-6">
            <p class="text-neutral-500">No other members yet.</p>
            {members.value.canInviteMembers && (
              <Link
                class="flex items-center space-x-1 text-blue-500"
                href="invite"
              >
                <LuUserPlus class="h-4 w-4" />
                <span>Invite someone.</span>
              </Link>
            )}
          </div>
        ) : (
          <table>
            <tbody>
              {members.value.members.map((member) => (
                <tr class="border-neutral-200 border-b" key={member.id}>
                  <td class="py-3 pr-6">{member.profileName}</td>
                  <td class="py-3 text-right">
                    {members.value.canRemoveMembers && (
                      <button
                        class="text-red-600 hover:underline"
                        onClick$={() => kickMember(member.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
});
