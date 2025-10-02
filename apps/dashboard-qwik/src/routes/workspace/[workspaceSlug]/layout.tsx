import type { RequestHandler } from "@builder.io/qwik-city";
import { middlewareAuthentication, verifyWorkspaceMembership } from "~/lib/auth";

export const onRequest: RequestHandler = async ({ next, params, cookie, redirect }) => {
    const sessionToken = cookie.get("session-token")?.value;
    const workspaceId = params.workspaceSlug;

    if (!workspaceId || !sessionToken) {
        throw redirect(300, "/auth/login");
    }

    const { authenticated, user } = await middlewareAuthentication(sessionToken);

    if (!authenticated || !user) {
        throw redirect(300, "/auth/login");
    }

    const { isMember, member, workspace } = await verifyWorkspaceMembership(user.id, workspaceId);

    if (!isMember || !member || !workspace) {
        throw redirect(300, "/auth/login?message=not%20a%20member%20of%20this%20workspace");
    }

    await next();
};