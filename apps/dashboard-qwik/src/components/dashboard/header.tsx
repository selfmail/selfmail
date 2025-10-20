import { component$, useStore, useTask$ } from "@builder.io/qwik";
import { Link, server$, useLocation } from "@builder.io/qwik-city";
import { LuPlaneTakeoff } from "@qwikest/icons/lucide";
import { db } from "database";
import {
    middlewareAuthentication,
    verifyWorkspaceMembership,
} from "~/lib/auth";

const getData = server$(async function () {
    const sessionToken = this.cookie.get("selfmail-session-token")?.value;
    const workspaceSlug = this.params.workspaceSlug;

    if (!workspaceSlug || !sessionToken) {
        throw Error("No workspace slug or session token provided.");
    }

    const { authenticated, user } = await middlewareAuthentication(sessionToken);

    if (!authenticated || !user) {
        throw Error("User is not authenticated. Please log in.");
    }

    const { isMember, member, workspace } = await verifyWorkspaceMembership(
        user.id,
        workspaceSlug,
    );

    if (!isMember || !member || !workspace) {
        throw Error("User is not a member of this workspace. Access denied.");
    }

    const currentWorkspace = await db.workspace.findUnique({
        where: {
            slug: workspaceSlug,
        },
    });
    if (!user || !currentWorkspace) {
        throw new Error("No user or workspace defined. Please try again.");
    }

    const workspaces = await db.workspace.findMany({
        where: {
            Member: {
                every: {
                    userId: user.id,
                },
            },
        },
    });

    if (workspaces.length === 0) {
        throw new Error(
            "User is not a member of any workspaces. Please try again.",
        );
    }

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
    const location = useLocation();
    const currentWorkspace = useStore({
        id: "",
        image: null as string | null,
        name: "",
    });

    useTask$(async () => {
        const data = await getData();
        currentWorkspace.id = data.currentWorkspace.id;
        currentWorkspace.image = data.currentWorkspace.image;
        currentWorkspace.name = data.currentWorkspace.name;
    });

    return (
        <header class="flex w-full flex-row items-center justify-between">
            <div class="flex cursor-pointer flex-row items-center space-x-3 rounded-lg pr-1 transition hover:bg-neutral-200 hover:ring-4 hover:ring-neutral-200">
                {currentWorkspace.image ? (
                    <img
                        src={currentWorkspace.image}
                        alt={currentWorkspace.name}
                        class="h-7 w-7 rounded-lg object-cover"
                    />
                ) : (
                    <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-600 font-medium text-lg text-white">
                        {currentWorkspace.name.charAt(0).toUpperCase()}
                    </div>
                )}
                <h3 class="font-medium text-lg">{currentWorkspace.name}</h3>
            </div>
            <Link
                href={`/workspace/${location.params.workspaceSlug}/compose${location.params.addressId ? `?addressId=${location.params.addressId}` : ""}`}
                class="flex w-min items-center space-x-3 rounded-xl border border-neutral-300 border-dashed p-2 text-center text-neutral-600 text-sm hover:bg-neutral-100! hover:ring-0"
                prefetch
            >
                <LuPlaneTakeoff class="inline-block h-5 w-5" />
                <span>Compose</span>
            </Link>
        </header>
    );
});
