import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import Header from "~/components/dashboard/header";
import {
  middlewareAuthentication,
  verifyWorkspaceMembership,
} from "~/lib/auth";
import type {
  MemberInSharedMap,
  UserInSharedMap,
  WorkspaceInSharedMap,
} from "./types";

export const onRequest: RequestHandler = async ({
  next,
  params,
  cookie,
  redirect,
  sharedMap,
}) => {
  const sessionToken = cookie.get("selfmail-session-token")?.value;
  const workspaceSlug = params.workspaceSlug;

  if (!(workspaceSlug && sessionToken)) {
    throw redirect(302, "/auth/login");
  }

  const { authenticated, user } = await middlewareAuthentication(sessionToken);

  if (!(authenticated && user)) {
    throw redirect(302, "/auth/login");
  }

  const { isMember, member, workspace } = await verifyWorkspaceMembership(
    user.id,
    workspaceSlug
  );

  if (!(isMember && member && workspace)) {
    throw redirect(
      302,
      "/auth/login?error=not%20a%20member%20of%20this%20workspace"
    );
  }

  sharedMap.set("user", user as UserInSharedMap);
  sharedMap.set("member", member as MemberInSharedMap);
  sharedMap.set("workspace", workspace as WorkspaceInSharedMap);

  await next();
};

export default component$(() => {
  return (
    <div class="flex min-h-screen w-full flex-col items-center bg-neutral-50">
      <div class="flex w-full flex-col gap-12 px-5 py-6 lg:px-26 xl:px-32">
        <Header />
        <Slot />
      </div>
    </div>
  );
});
