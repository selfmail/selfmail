import { $, component$ } from "@builder.io/qwik";
import { Link, routeLoader$, server$, z } from "@builder.io/qwik-city";
import { db } from "database";
import BackHeading from "~/components/ui/BackHeading";
import { hasPermissions, permissions } from "~/lib/permissions";
import type {
    MemberInSharedMap,
    UserInSharedMap,
    WorkspaceInSharedMap,
} from "../types";
import { middlewareAuthentication, verifyWorkspaceMembership } from "~/lib/auth";
import AlertDialog from "~/components/ui/AlertDialog";
import { toast } from "qwik-sonner";

const useDomains = routeLoader$(async ({ sharedMap, error }) => {
    const user = sharedMap.get("user") as UserInSharedMap;

    if (!user || !user.id) {
        throw error(500, "Internal Server Error: User not found");
    }

    const member = sharedMap.get("member") as MemberInSharedMap;

    if (!member || !member.id) {
        throw error(500, "Internal Server Error: Member not found");
    }

    const workspace = sharedMap.get("workspace") as WorkspaceInSharedMap;
    if (!workspace || !workspace.id) {
        throw error(500, "Internal Server Error: Workspace not found");
    }

    const userPermissions = await permissions({
        memberId: member.id,
        workspaceId: workspace.id,
        permissions: ["domains:add", "domains:remove", "domains:update"],
    });

    const domains = await db.domain.findMany({
        where: {
            workspaceId: workspace.id,
        },
    });

    return {
        domains,
        canAddDomain: userPermissions.includes("domains:add"),
        canRemoveDomain: userPermissions.includes("domains:remove"),
        canUpdateDomain: userPermissions.includes("domains:update"),
    };
});

const removeDomain = server$(async function (domainId: string) {
    const parse = await z.string().min(8).max(9).safeParseAsync(domainId)
    if (!parse.success) {
        throw new Error("Invalid domain ID");
    }

    let currentMember = this.sharedMap.get("member") as MemberInSharedMap;

    if (!currentMember) {
        const sessionToken = this.cookie.get("selfmail-session-token")?.value;
        const workspaceSlug = this.params.workspaceSlug;

        if (!workspaceSlug || !sessionToken) {
            throw Error("No workspace slug or session token provided.");
        }

        const { authenticated, user } =
            await middlewareAuthentication(sessionToken);

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
        currentMember = member;
    }

    // check for member permissions
    const userPermisssion = await hasPermissions({
        memberId: currentMember.id,
        workspaceId: currentMember.workspaceId,
        permissions: ["domains:remove"],
    })

    if (!userPermisssion) {
        return {
            success: false,
            message: "You do not have permission to remove domains.",
        }
    }

    try {
        await db.domain.delete({
            where: {
                id: domainId,
            },
        });
    } catch (error) {
        return {
            success: false,
            message: "Failed to remove domain",
        }
    }

    return {
        success: true
    }
})

export default component$(() => {
    const domains = useDomains();

    return (
        <>
            <div class="flex flex-col space-y-3">
                <BackHeading>Domains ({domains.value.domains.length})</BackHeading>
                <p class="text-neutral-500">
                    You can {domains.value.canAddDomain ? "add" : "view"} custom domains
                    for this workspace here. Your workspace has currently {domains.value.domains.length} domain{domains.value.domains.length === 1 ? "" : "s"}.
                </p>
            </div>
            <div class="flex flex-col space-y-3">
                {domains.value.domains.length === 0 ? (
                    <div class="flex flex-col space-y-1">
                        <p class="text-neutral-500">No domains added yet.</p>
                        {domains.value.canAddDomain && (
                            <Link href="new" class="text-blue-500">
                                Add a new domain
                            </Link>
                        )}
                    </div>
                ) : (
                    <ul class="flex flex-col gap-4">
                        {domains.value.domains.map((domain) => (
                            <li
                                key={domain.id}
                                class="rounded-xl border border-neutral-200 bg-white p-4"
                            >
                                <div class="flex items-center justify-between">
                                    <div class="flex flex-row">
                                        <span class="font-medium">{domain.domain}</span>
                                        {
                                            !domain.verified && (
                                                <Link href={`verify?domain=${domain.domain}`} class="text-blue-500">
                                                    Verify Now
                                                </Link>
                                            )
                                        }
                                    </div>
                                    <div class="flex flex-row items-center space-x-3">
                                        <span
                                            class={`rounded-full px-2 py-1 font-semibold text-sm ${domain.verified
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            {domain.verified ? "Verified" : "Unverified"}
                                        </span>
                                        {(
                                            <AlertDialog
                                                title={`Remove ${domain.domain}?`}
                                                description={`Are you sure you want to remove ${domain.domain}? This action can't be undone.`}
                                                class="rounded-full cursor-pointer bg-red-100 text-red-800 px-2 py-1 font-semibold text-sm"

                                                proceedActionText="Delete Domain"
                                                proceedAction={$(async () => {
                                                    const result = await removeDomain(domain.id);
                                                    if (result.success) {
                                                        // Reload the page to reflect changes
                                                        window.location.reload();
                                                    } else {
                                                        toast.error(result.message || "Failed to remove domain");
                                                    }
                                                })}
                                            >
                                                Remove
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div >
        </>
    );
});
