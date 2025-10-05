import { $, component$ } from "@builder.io/qwik";
import { server$, z } from "@builder.io/qwik-city";
import { db } from "database";
import EmailList from "~/components/dashboard/email-list";
import type {
    MemberInSharedMap,
    WorkspaceInSharedMap,
} from "./types";

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
    const workspace = this.sharedMap.get("workspace") as WorkspaceInSharedMap;

    const emails = await db.email.findMany({
        where: {
            sort: {
                notIn: ["sent", "spam", "trash"],
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
                }
            }
        }
    });

    console.log("Hello from server!")

    return emails;
});

export default component$(() => {
    const getEmails = $(
        async function getEmails(params: { page: number; take: number }) {
            const emails = await fetchEmails(params);
            return emails;
        }
    )

    const Email = $(() => {
        return <div>Email Component</div>;
    })


    return (
        <>
            <h1 class="font-medium text-2xl">Unified Inbox</h1>
            {/* @ts-expect-error Server Component */}
            <EmailList EmailComponent={Email} fetchEmails={getEmails} />
        </>
    );
});