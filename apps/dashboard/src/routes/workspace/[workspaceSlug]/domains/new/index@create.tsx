import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import {
    Form,
    routeAction$,
    routeLoader$,
    z,
    zod$,
} from "@builder.io/qwik-city";
import { init } from "@paralleldrive/cuid2";
import { db, type Workspace } from "database";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { checkLimits } from "~/lib/billing";
import { hasPermissions } from "~/lib/permissions";
import type { MemberInSharedMap, UserInSharedMap } from "../../types";

export const useCreateDomainDraft = routeAction$(
    async ({ workspace: { domain } }, { redirect, params, sharedMap, error }) => {
        // check whether the domain exists
        const existingDomain = await db.domain.findUnique({
            where: {
                domain,
            },
        });

        if (existingDomain) {
            return {
                fieldErrors: {
                    domain:
                        "Domain already added to a workspace. Please delete the domain first if you want to add it to this workspace.",
                },
                failed: true,
            };
        }

        const createId = init({
            length: 8,
        });

        const workspace = sharedMap.get("workspace") as Workspace;

        if (!workspace || !workspace.id) {
            throw error(500, "Internal Server Error");
        }

        const createdTime = new Date();

        const domainDraft = await db.domain.create({
            data: {
                id: createId(),
                domain,
                createdAt: createdTime,
                verificationToken: `selfmail-domain-verification-${Buffer.from(createdTime.toUTCString()).toString("base64")}-${createId()}`,
                workspaceId: workspace.id,
                public: false,
                verified: false,
            },
        });

        if (!domainDraft) {
            return {
                fieldErrors: {
                    domain: "Failed to create domain. Please try again.",
                },
                failed: true,
            };
        }

        redirect(
            302,
            `/workspace/${params.workspaceSlug}/domains/verify?domain=${domainDraft.domain}`,
        );
    },
    zod$({
        workspace: z.object({
            domain: z.string().min(1, "Domain is required").max(255),
        }),
    }),
);

const useLimits = routeLoader$(async ({ sharedMap, error }) => {
    // Check if the user has the right to add new domains
    if (!sharedMap.has("user") || !sharedMap.get("user").id) {
        throw error(401, "Unauthorized");
    }

    const user = sharedMap.get("user") as UserInSharedMap;

    if (!sharedMap.has("member") || !sharedMap.get("member").id) {
        throw error(401, "Unauthorized");
    }

    const member = sharedMap.get("member") as MemberInSharedMap;

    if (
        !sharedMap.has("workspace") ||
        !sharedMap.get("workspace").id ||
        !sharedMap.get("workspace").ownerId
    ) {
        throw error(400, "Workspace not found in shared map");
    }

    // check whether the current member has the right to add new domains
    const permissions = await hasPermissions({
        memberId: member.id,
        workspaceId: member.workspaceId,
        permissions: ["create:domain"],
    });

    if (!permissions && user.id !== sharedMap.get("workspace").ownerId) {
        throw error(403, "You do not have permission to add new domains");
    }
    const limits = await checkLimits(member.id);

    return {
        maxDomains: limits.maxDomains,
        currentDomains: limits.currentDomains,
        canAddMore: limits.currentDomains < limits.maxDomains,
    };
});

export default component$(() => {
    const limits = useLimits();
    const create = useCreateDomainDraft();

    const fieldErrors = useStore({
        domain: "",
    });

    useVisibleTask$(async ({ track }) => {
        track(() => create.value?.fieldErrors);
        console.log(create.value?.fieldErrors);

        if (create.value?.failed) {
            const errors = create.value.fieldErrors as Record<string, string>;
            fieldErrors.domain = errors.domain || "";

            return;
        }
    });

    return (
        <div class="flex min-h-screen w-full items-center justify-center bg-neutral-50">
            <Form action={create} class="flex w-full max-w-md flex-col gap-4">
                <h1 class="font-medium text-2xl">Add a new Domain</h1>
                <p class="text-neutral-500 text-sm">
                    After that, you'll need to place an TXT records and a MX Record in
                    your DNS settings.
                </p>
                <Input name="workspace.domain" placeholder="Domain" required />
                {fieldErrors.domain && <p class="text-red-700">{fieldErrors.domain}</p>}
                <p
                    class={`text-sm ${limits.value.canAddMore ? "text-neutral-500" : "text-red-700"}`}
                >
                    Your workspace has used {limits.value.currentDomains} out of{" "}
                    {limits.value.maxDomains} domains.
                </p>
                <Button
                    class="disabled:cursor-not-allowed disabled:active:scale-100"
                    disabled={!limits.value.canAddMore}
                >
                    {!limits.value.canAddMore
                        ? "Limit reached"
                        : create.isRunning
                            ? "Creating..."
                            : "Add Domain"}
                </Button>
            </Form>
        </div>
    );
});
