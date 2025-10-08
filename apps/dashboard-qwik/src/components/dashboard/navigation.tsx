import { component$, useStore, useTask$ } from "@builder.io/qwik";
import { Link, server$, useLocation } from "@builder.io/qwik-city";
import { db } from "database";
import type { MemberInSharedMap } from "~/routes/workspace/[workspaceSlug]/types";
import { NavLink } from "../ui/NavLink";

const getAddresses = server$(async function () {
    const member = this.sharedMap.get("member") as MemberInSharedMap;
    const memberAddresses = await db.address.findMany({
        where: {
            MemberAddress: {
                every: {
                    memberId: member.id,
                },
            },
        },
    });


    return memberAddresses;
});

export default component$(() => {
    const location = useLocation()
    const addresses = useStore({
        data: [] as { id: string; email: string }[],
    });

    useTask$(async ({ track }) => {
        track(() => location.params.workspaceSlug,)
        addresses.data = await getAddresses();
    });

    const links = {
        platform: {
            api: "/api",
            ai: "/ai",
            workflows: "/workflows",
        },
        workspace: {
            member: "/members",
            billing: "/billing",
            settings: "/settings",
        }
    }

    return (
        <div class="flex w-full flex-row justify-between">
            <div class="flex flex-col gap-3">
                <p class="text-neutral-700 text-sm">Addresses</p>
                {
                    addresses.data.map((address) => (
                        <NavLink
                            key={address.id}
                            href={`/workspace/${location.params.workspaceSlug}/address/${address.id}`}
                            activeClass="bg-blue-100 text-blue-700 font-medium"
                        >
                            {address.email}
                        </NavLink>
                    ))
                }
                {
                    addresses.data.length === 0 && (
                        <p class="text-neutral-500 text-sm">No addresses found. Create a <Link href={`/workspace/${location.params.workspaceSlug}/address/new`} class="text-blue-500" prefetch>new address</Link>.</p>
                    )
                }
            </div>
            <div class="flex flex-col gap-3">
                <p class="text-neutral-700 text-sm">Platform</p>
                {
                    links.platform && Object.entries(links.platform).map(([key, value]) => (
                        <NavLink
                            key={key}
                            href={`/workspace/${location.params.workspaceSlug}${value}`}
                            activeClass="bg-blue-100 text-blue-700 font-medium"
                        >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </NavLink>
                    ))
                }
            </div>
            <div class="flex flex-col gap-3">
                <p class="text-neutral-700 text-sm">Workspace</p>
                {
                    links.workspace && Object.entries(links.workspace).map(([key, value]) => (
                        <NavLink
                            key={key}
                            href={`/workspace/${location.params.workspaceSlug}${value}`}
                            activeClass="bg-blue-100 text-blue-700 font-medium"
                        >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </NavLink>
                    ))
                }
            </div>
        </div>
    );
});
