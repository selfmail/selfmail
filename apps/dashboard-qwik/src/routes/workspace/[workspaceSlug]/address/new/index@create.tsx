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
import { LuPlus } from "@qwikest/icons/lucide";
import { db } from "database";
import { Activity } from "services/activity";
import { Analytics } from "services/analytics";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import type { MemberInSharedMap, WorkspaceInSharedMap } from "../../types";

export const useCreateAddress = routeAction$(
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
            length: 8,
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

        Activity.capture({
            color: "positive",
            description: `Created new address: ${address.email}`,
            title: "Address Created",
            type: "note",
            workspaceId: member.workspaceId,
            userId: member.userId,
        });

        Analytics.captureDashboardEvent({
            distinctId: member.id,
            event: "address.created",
            properties: {
                domain
            },
        })

        redirect(302, `/workspace/${params.workspaceSlug}/address/${address.id}`);
    },
    zod$({
        address: z.object({
            domain: z.string().min(1, "Domain is required").max(255),
            emailHandle: z.string().min(1, "Email Handle is required").max(255),
        }),
    }),
);

const useAvaiableDomains = routeLoader$(async ({ sharedMap }) => {
    const workspace = sharedMap.get("workspace") as WorkspaceInSharedMap;

    if (!workspace) {
        return [];
    }

    const domains = await db.domain.findMany({
        where: {
            verified: true,
        },
    });

    return domains.map((domain) => domain.domain);
});

export default component$(() => {
    const create = useCreateAddress();
    const location = useLocation();
    const domains = useAvaiableDomains();

    const fieldErrors = useStore({
        emailHandle: "",
        domain: "",
    });

    useVisibleTask$(async ({ track }) => {
        track(() => create.value?.fieldErrors);

        if (create.value?.failed) {
            const errors = create.value.fieldErrors as Record<string, string>;
            console.log(errors);
            fieldErrors.emailHandle = errors.emailHandle || "";
            fieldErrors.domain = errors.domain || "";

            console.log(fieldErrors);

            return;
        }
    });

    return (
        <div class="flex min-h-screen w-full items-center justify-center bg-neutral-50">
            <Form action={create} class="flex w-full max-w-md flex-col gap-4">
                <h1 class="font-medium text-2xl">Create a new Address</h1>
                <Input name="address.emailHandle" placeholder="Email Handle" required />
                {fieldErrors.emailHandle && (
                    <p class="text-red-700">{fieldErrors.emailHandle}</p>
                )}
                <select
                    class="flex h-9 w-full rounded-md border border-neutral-100 bg-neutral-100 px-3 py-2 text-sm outline-none ring-offset-background transition-all file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground hover:bg-neutral-200 focus-visible:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
                    name="address.domain"
                    id=""
                >
                    {domains.value?.map((domain) => (
                        <option key={domain} value={domain}>{`@${domain}`}</option>
                    ))}
                    {(domains.value?.length === 0 || !domains.value) && (
                        <option disabled>
                            No domains available. Please add a domain to your workspace.
                        </option>
                    )}
                </select>
                {fieldErrors.domain && <p class="text-red-700">{fieldErrors.domain}</p>}
                <Link
                    href={`/workspace/${location.params.workspaceSlug}/domains/new`}
                    class="flex items-center space-x-2 text-neutral-500 text-sm"
                >
                    <LuPlus class="inline-block h-4 w-4" />
                    <span class="text-neutral-500 underline">
                        Add a new Domain to your workspace.
                    </span>
                </Link>
                <Button>{create.isRunning ? "Creating..." : "Create Address"}</Button>
            </Form>
        </div>
    );
});
