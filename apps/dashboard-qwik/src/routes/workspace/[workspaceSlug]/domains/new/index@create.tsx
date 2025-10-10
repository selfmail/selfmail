import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import {
    Form,
    routeAction$,
    routeLoader$,
    z,
    zod$,
} from "@builder.io/qwik-city";
import { init } from "@paralleldrive/cuid2";
import { db } from "database";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import type { MemberInSharedMap, UserInSharedMap } from "../../types";

export const useCreateDomainDraft = routeAction$(
    async ({ workspace: { domain } }, { redirect, params }) => {
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

        const domainDraft = await db.domain.create({
            data: {
                id: createId(),
                domain,
                verificationToken: `selfmail-domain-verification-${new Date().toISOString()}-${createId()}`,
                workspaceId: params.workspaceSlug,
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

        redirect(302, `/workspace/${params.workspaceSlug}/domains`);
    },
    zod$({
        workspace: z.object({
            domain: z.string().min(1, "Domain is required").max(255),
        }),
    }),
);

const useLimits = routeLoader$(async ({ sharedMap, error }) => {
    if (!sharedMap.has("user") || !sharedMap.get("user").id) {
        throw error(401, "Unauthorized");
    }

    const user = sharedMap.get("user") as UserInSharedMap;

    if (!sharedMap.has("member") || !sharedMap.get("member").id) {
        throw error(401, "Unauthorized");
    }

    const member = sharedMap.get("member") as MemberInSharedMap;

    if (!sharedMap.has("workspace") || !sharedMap.get("workspace").id) {
        throw error(400, "Workspace not found in shared map");
    }
    // check whether the current member has the right to add new domains
    const permissions = await db.memberPermission.findUnique({
        where: {
            memberId_permissionName: {
                memberId: member.id,
                permissionName: "domains:create",
            },
        },
    });

    // check whether the user is the workspace owner
    const workspace = sharedMap.get("workspace") as {
        id: string;
        ownerId: string;
    };
    if (user.id === workspace.ownerId) {
        console.log("User is the workspace owner");
        return {};
    }

    if (!permissions) {
        throw error(403, "You do not have permission to add new domains");
    }
});

export default component$(() => {
    const limits = useLimits();
    const create = useCreateDomainDraft();

    const fieldErrors = useStore({
        domain: "",
    });

    useVisibleTask$(async ({ track }) => {
        track(() => create.value?.fieldErrors);

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
                <Button>{create.isRunning ? "Creating..." : "Add Domain"}</Button>
            </Form>
        </div>
    );
});
