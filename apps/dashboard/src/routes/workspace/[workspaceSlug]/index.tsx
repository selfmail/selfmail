import { $, component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, server$, z } from "@builder.io/qwik-city";
import { db } from "database";
import EmailList from "~/components/dashboard/email-list";
import {
    middlewareAuthentication,
    verifyWorkspaceMembership,
} from "~/lib/auth";
import type { MemberInSharedMap } from "./types";

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

    const emails = await db.email.findMany({
        where: {
            sort: {
                notIn: ["sent", "spam", "trash"],
            },
            address: {
                MemberAddress: {
                    every: {
                        memberId: currentMember.id,
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

const useEmailCount = routeLoader$(async ({ sharedMap }) => {
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
                    <h1 class="font-medium text-2xl">Unified Inbox</h1>
                    <p class="text-neutral-600">{count.value} emails</p>
                </div>
            </div>
            {/* @ts-expect-error Server Component */}
            <EmailList EmailComponent={Email} fetchEmails={getEmails} />
        </>
    );
});

// Dynamic head that includes email count and workspace info
export const head: DocumentHead = ({ resolveValue, params }) => {
    const emailCount = resolveValue(useEmailCount);
    const workspaceSlug = params.workspaceSlug;

    return {
        title: `Unified Inbox - ${workspaceSlug} | Selfmail`,
        meta: [
            {
                name: "description",
                content: `Manage your unified inbox with ${emailCount} emails in ${workspaceSlug} workspace on Selfmail.`,
            },
            {
                property: "og:title",
                content: `Unified Inbox - ${workspaceSlug} | Selfmail`,
            },
            {
                property: "og:description",
                content: `Manage your unified inbox with ${emailCount} emails in ${workspaceSlug} workspace on Selfmail.`,
            },
            {
                property: "og:type",
                content: "website",
            },
            {
                name: "robots",
                content: "noindex, nofollow", // Private dashboard pages shouldn't be indexed
            },
        ],
        links: [
            {
                rel: "canonical",
                href: `https://app.selfmail.com/workspace/${workspaceSlug}`,
            },
        ],
    };
};
