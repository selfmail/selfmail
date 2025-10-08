import { $, component$ } from "@builder.io/qwik";
import { routeLoader$, server$, z } from "@builder.io/qwik-city";
import { db } from "database";
import EmailList from "~/components/dashboard/email-list";
import type { MemberInSharedMap } from "../../types";

const fetchEmails = server$(async function ({
    page = 0,
    take = 20,
}: {
    page: number;
    take: number;
}) {
    const parse = await z
        .object({
            page: z.number().min(0).default(0),
            take: z.number().min(1).max(100).default(20),
        })
        .safeParseAsync({ page, take });

    if (!parse.success) {
        throw new Error("Invalid parameters");
    }

    const member = this.sharedMap.get("member") as MemberInSharedMap;

    const emails = await db.email.findMany({
        where: {
            sort: {
                notIn: ["sent", "spam", "trash"],
            },
            address: {
                id: this.params.addressId,
                MemberAddress: {
                    every: {
                        memberId: member.id,
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        skip: parse.data.page * parse.data.take,
        take: parse.data.take,
        include: {
            address: {
                select: {
                    email: true,
                    id: true,
                },
            },
        },
    });

    return emails;
});

const useAddress = routeLoader$(async ({ sharedMap, params }) => {
    const member = sharedMap.get("member") as MemberInSharedMap;

    if (!member) {
        throw new Error("Member not found in shared map");
    }

    const address = await db.address.findUnique({
        where: {
            id: params.addressId,
            MemberAddress: {
                every: {
                    memberId: member.id,
                },
            },
        },
        select: {
            email: true,
            id: true,
        },
    });

    if (!address) {
        throw new Error("Address not found");
    }

    return address;
})

const useEmailCount = routeLoader$(async ({ sharedMap, params }) => {
    const member = sharedMap.get("member") as MemberInSharedMap;

    if (!member) {
        return 0;
    }

    const count = await db.email.count({
        where: {
            sort: {
                notIn: ["sent", "spam", "trash"],
            },
            address: {
                id: params.addressId,
                MemberAddress: {
                    every: {
                        memberId: member.id,
                    },
                },
            },
        },
    });

    return count;
});

export default component$(() => {
    const count = useEmailCount();
    const address = useAddress();

    // fetch emails function to be passed to email list
    const getEmails = $(async function getEmails(params: {
        page: number;
        take: number;
    }) {
        const emails = await fetchEmails(params);
        return emails;
    });

    // simple email component to be passed to email list
    const Email = $(() => {
        return <div>Email Component</div>;
    });

    return (
        <>
            <div class="flex w-full flex-row items-center justify-between">
                <div class="flex flex-col gap-1">
                    <h1 class="font-medium text-2xl">Emails for {address.value.email}</h1>
                    <p class="text-neutral-600">{count.value} emails</p>
                </div>
            </div>
            {/* @ts-expect-error Server Component */}
            <EmailList EmailComponent={Email} fetchEmails={getEmails} />
        </>
    );
});
