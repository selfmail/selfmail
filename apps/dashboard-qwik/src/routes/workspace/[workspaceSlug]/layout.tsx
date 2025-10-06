import { component$, Slot } from "@builder.io/qwik";
import { type RequestHandler, routeLoader$ } from "@builder.io/qwik-city";
import Header from "~/components/dashboard/header";
import {
    middlewareAuthentication,
    verifyWorkspaceMembership,
} from "~/lib/auth";
import type { UserInSharedMap, WorkspaceInSharedMap } from "./types";

export const onRequest: RequestHandler = async ({
    next,
    params,
    cookie,
    redirect,
    sharedMap,
}) => {
    const sessionToken = cookie.get("selfmail-session-token")?.value;
    const workspaceSlug = params.workspaceSlug;

    if (!workspaceSlug || !sessionToken) {
        console.log(
            `no workspace slug or session token ${workspaceSlug} ${sessionToken}`,
        );
        throw redirect(302, "/auth/login");
    }

    const { authenticated, user } = await middlewareAuthentication(sessionToken);

    if (!authenticated || !user) {
        console.log("not authenticated");
        throw redirect(302, "/auth/login");
    }

    const { isMember, member, workspace } = await verifyWorkspaceMembership(
        user.id,
        workspaceSlug,
    );

    if (!isMember || !member || !workspace) {
        console.log("not a member of this workspace");
        throw redirect(
            302,
            "/auth/login?message=not%20a%20member%20of%20this%20workspace",
        );
    }

    sharedMap.set("user", user);
    sharedMap.set("member", member);
    sharedMap.set("workspace", workspace);

    await next();
};

export const useHeaderData = routeLoader$(({ sharedMap }) => {
    const user = sharedMap.get("user") as UserInSharedMap;
    const currentWorkspace = sharedMap.get("workspace") as WorkspaceInSharedMap;
    if (!user || !currentWorkspace) {
        throw new Error("No user or workspace defined. Please try again.");
    }

    const workspaces = user.member
        .map((m) => {
            if (m.workspace.id !== currentWorkspace.id) {
                return {
                    id: m.workspace.id,
                    name: m.workspace.name,
                    slug: m.workspace.slug,
                    image: m.workspace.image,
                };
            }

            return null;
        })
        .filter(Boolean);

    return {
        user: {
            username: user.name,
            email: user.email,
        },
        userWorkspaces: workspaces,
        currentWorkspace: {
            id: currentWorkspace.id,
            image: currentWorkspace.image,
            name: currentWorkspace.name,
        },
    };
});

export default component$(() => {
    const header = useHeaderData();
    return (
        <div class="flex min-h-screen w-full flex-col items-center bg-neutral-50">
            <div class="flex w-full flex-col gap-6 px-5 py-6 lg:px-26 xl:px-32">
                <Header value={header.value} />
                <Slot />
            </div>
        </div>
    );
});