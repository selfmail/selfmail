import { component$, useStore, useTask$ } from "@builder.io/qwik";
import { Link, server$, useLocation } from "@builder.io/qwik-city";
import { db } from "database";
import {
  middlewareAuthentication,
  verifyWorkspaceMembership,
} from "~/lib/auth";
import { NavLink } from "../ui/NavLink";

const getAddresses = server$(async function () {
  const sessionToken = this.cookie.get("selfmail-session-token")?.value;
  const workspaceSlug = this.params.workspaceSlug;

  if (!(workspaceSlug && sessionToken)) {
    throw new Error("No workspace slug or session token provided.");
  }

  const { authenticated, user } = await middlewareAuthentication(sessionToken);

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
  const memberAddresses = await db.address.findMany({
    where: {
      MemberAddress: {
        every: {
          memberId: member.id,
        },
      },
    },
  });

  return memberAddresses;
});

export default component$(() => {
  const location = useLocation();
  const addresses = useStore({
    data: [] as { id: string; email: string }[],
  });

  useTask$(async ({ track }) => {
    track(() => location.params.workspaceSlug);
    addresses.data = await getAddresses();
  });

  const links = {
    platform: {
      ai: "/ai",
      workflows: "/workflows",
      developers: "/developers",
      changelog: "/changelog",
    },
    workspace: {
      members: "/members",
      billing: "/billing",
      activity: "/activity",
      storage: "/storage",
      settings: "/settings",
      domains: "/domains",
    },
  };

  return (
    <div class="flex w-full flex-row justify-between">
      <div class="flex flex-col gap-3">
        <p class="text-neutral-700 text-sm">Addresses</p>
        {addresses.data.map((address) => (
          <NavLink
            activeClass="bg-blue-100 text-blue-700 font-medium"
            href={`/workspace/${location.params.workspaceSlug}/address/${address.id}`}
            key={address.id}
          >
            {address.email}
          </NavLink>
        ))}

        {(addresses.data.length === 0 && (
          <p class="text-neutral-500 text-sm">
            No addresses found. Create a{" "}
            <Link
              class="text-blue-500"
              href={`/workspace/${location.params.workspaceSlug}/address/new`}
              prefetch
            >
              new address
            </Link>
            .
          </p>
        )) || (
          <Link
            class="text-blue-500 text-sm"
            href={`/workspace/${location.params.workspaceSlug}/address/new`}
            prefetch
          >
            + Add new address
          </Link>
        )}
      </div>
      <div class="flex flex-col gap-3">
        <p class="text-neutral-700 text-sm">Platform</p>
        {links.platform &&
          Object.entries(links.platform).map(([key, value]) => (
            <NavLink
              activeClass="bg-blue-100 text-blue-700 font-medium"
              href={`/workspace/${location.params.workspaceSlug}${value}`}
              key={key}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </NavLink>
          ))}
      </div>
      <div class="flex flex-col gap-3">
        <p class="text-neutral-700 text-sm">Workspace</p>
        {links.workspace &&
          Object.entries(links.workspace).map(([key, value]) => (
            <NavLink
              activeClass="bg-blue-100 text-blue-700 font-medium"
              href={`/workspace/${location.params.workspaceSlug}${value}`}
              key={key}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </NavLink>
          ))}
      </div>
    </div>
  );
});
