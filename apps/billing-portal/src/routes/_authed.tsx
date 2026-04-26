import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCurrentUserFn } from "#/utils/auth";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async () => {
    const user = await getCurrentUserFn();

    if (user.status === "unauthenticated") {
      throw redirect({
        href: user.loginHref,
      });
    }

    return {
      user: user.user,
    };
  },
});
