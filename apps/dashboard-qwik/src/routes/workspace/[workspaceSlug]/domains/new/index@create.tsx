import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import {
    Form,
    Link,
    routeAction$,
    routeLoader$,
    useLocation,
    z,
    zod$,
} from "@builder.io/qwik-city";
import { init } from "@paralleldrive/cuid2";
import { db } from "database";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import type { MemberInSharedMap, WorkspaceInSharedMap } from "../../types";

export const useCreateDomainDraft = routeAction$(
    async (
        { address: { domain, emailHandle } },
        { sharedMap, error, redirect, params },
    ) => {
        if (!sharedMap.has("member") || !sharedMap.get("member").id) {
            throw error(401, "Unauthorized");
        }

        const member = sharedMap.get("member") as MemberInSharedMap;

        const existingAddress = await db.address.findUnique({
            where: {
                email: `${emailHandle}@${domain}`,
            },
        });

        if (existingAddress) {
            return {
                fieldErrors: {
                    emailHandle: "An address with this email already exists",
                },
                failed: true,
            };
        }

        // check whether the domain exists
        const existingDomain = await db.domain.findUnique({
            where: {
                domain,
            },
        });

        if (!existingDomain) {
            return {
                fieldErrors: {
                    domain: "Domain does not exist",
                },
                failed: true,
            };
        }

        const createId = init({
            length: 8
        });

        // create new address
        const address = await db.address.create({
            data: {
                id: createId(),
                email: `${emailHandle}@${domain}`,
                handle: emailHandle,
                MemberAddress: {
                    create: {
                        memberId: member.id,
                    },
                },
                Domain: {
                    connect: {
                        domain,
                    },
                },
            },
        });

        if (!address) {
            return {
                fieldErrors: {
                    address: "Failed to create address",
                },
                failed: true,
            };
        }

        redirect(302, `/workspace/${params.workspaceSlug}/address/${address.id}`);
    },
    zod$({
        address: z.object({
            domain: z.string().min(1, "Domain is required").max(255),
            emailHandle: z.string().min(1, "Email Handle is required").max(255),
        }),
    }),
);

const useLimits = routeLoader$(
    async ({ sharedMap, error, params }) => {
        if (!sharedMap.has("member") || !sharedMap.get("member").id) {
            throw error(401, "Unauthorized");
        }

        const member = sharedMap.get("member") as MemberInSharedMap;

        if (!sharedMap.has("workspace") || !sharedMap.get("workspace").id) {
            throw error(400, "Workspace not found in shared map");
        }

        const workspace = sharedMap.get("workspace") as WorkspaceInSharedMap;

        // check whether the current member has the right to add new domains
        const permissions = await db.memberPermission.findUnique({
            where: {
                memberId_permissionName: {
                    memberId: member.id,
                    permissionName: "domains:create",
                }
            }
        })

        if (!permissions) {
            throw error(403, "You do not have permission to add new domains");
        }


    })

export default component$(() => {
    const limits = useLimits()
    const create = useCreateDomainDraft();

    const fieldErrors = useStore({
        emailHandle: "",
        domain: "",
    });

    useVisibleTask$(async ({ track }) => {
        track(() => create.value?.fieldErrors);

        if (create.value?.failed) {
            const errors = create.value.fieldErrors as Record<string, string>;
            fieldErrors.emailHandle = errors.emailHandle || "";
            fieldErrors.domain = errors.domain || "";

            return;
        }
    });

    return (
        <div class="flex min-h-screen w-full items-center justify-center bg-neutral-50">
            <Form action={create} class="flex w-full max-w-md flex-col gap-4">
                <h1 class="font-medium text-2xl">Add a new Domain</h1>
                <Input name="address.emailHandle" placeholder="Email Handle" required />
                {fieldErrors.emailHandle && (
                    <p class="text-red-700">{fieldErrors.emailHandle}</p>
                )}
                <Button>{create.isRunning ? "Creating..." : "Create Address"}</Button>
            </Form>
        </div>
    );
});
