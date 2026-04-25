import { Authentication } from "@selfmail/authentication";
import { createLogger } from "@selfmail/logging";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCookie } from "@tanstack/react-start/server";
import { getLoginHref } from "#/lib/auth";

const logger = createLogger("dashboard-auth-route");
export const Route = createFileRoute("/_authed")({
  beforeLoad: async () => {
    // This route doesn't render anything itself, but ensures that the user is authenticated before accessing any child routes.
    // If the user is not authenticated, they will be redirected to the login page by the getCurrentUserFn in lib/auth.ts.
    const authentication = new Authentication({ identifier: "dashboard" });
    const token = getCookie("selfmail-session-token");

    if (!token) {
      logger.warn("No session token found in cookies");
      throw redirect({
        href: getLoginHref(),
      });
    }

    try {
      const user = await authentication.getCurrentUser({ token });
      if (!user) {
        logger.warn("No user found for provided session token", { token });
        throw redirect({
          href: getLoginHref(),
        });
      }
      return user;
    } catch (error: unknown) {
      logger.error(
        "Error fetching current user",
        error instanceof Error ? error : undefined
      );
      throw redirect({
        href: getLoginHref(),
      });
    }
  },
});
