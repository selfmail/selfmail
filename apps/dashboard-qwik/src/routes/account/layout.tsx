import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import type { User } from "database";
import AccountHeader from "~/components/dashboard/account-header";
import { middlewareAuthentication } from "~/lib/auth";

export type UserInSharedMap = User;

const HTTP_REDIRECT = 302;

export const onRequest: RequestHandler = async ({
  next,
  cookie,
  redirect,
  sharedMap,
}) => {
  const sessionToken = cookie.get("selfmail-session-token")?.value;

  if (!sessionToken) {
    throw redirect(HTTP_REDIRECT, "/auth/login");
  }

  const { authenticated, user } = await middlewareAuthentication(sessionToken);

  if (!(authenticated && user)) {
    throw redirect(HTTP_REDIRECT, "/auth/login");
  }

  sharedMap.set("user", user as UserInSharedMap);

  await next();
};

export default component$(() => (
  <div class="flex min-h-screen w-full flex-col items-center bg-neutral-50">
    <div class="flex w-full flex-col gap-12 px-5 py-6 lg:px-26 xl:px-32">
      <AccountHeader />
      <Slot />
    </div>
  </div>
));
