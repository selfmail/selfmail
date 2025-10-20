import { routeLoader$ } from "@builder.io/qwik-city";
import { db } from "database";
import { permissions } from "~/lib/permissions";
import type { MemberInSharedMap, WorkspaceInSharedMap } from "../types";

const useBilling = routeLoader$(async ({ sharedMap, error }) => {
    const workspace = sharedMap.get("workspace") as WorkspaceInSharedMap;
    const member = sharedMap.get("member") as MemberInSharedMap;

    const memberPermissions = await permissions({
        memberId: member.id,
        workspaceId: workspace.id,
        permissions: ["payments:read", "payments:update", "payments:delete"],
    });

    if (!memberPermissions.includes("payments:read")) {
        throw error(403, "You do not have permission to view billing information.");
    }

    const billingInfo = await db.plan.findUnique({
        where: {
            id: workspace.planId,
        },
        select: {
            description: true,
            maxAddresses: true,
            maxDomains: true,
            maxMembers: true,
            name: true,
            storageBytes: true,
            softBytesMemberLimit: true,
            priceEuroCents: true,
        },
    });


});
