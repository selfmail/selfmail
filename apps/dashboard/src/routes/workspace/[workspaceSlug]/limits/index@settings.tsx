import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { db } from "database";
import BackHeading from "~/components/ui/BackHeading";

const useStorage = routeLoader$(async ({ sharedMap }) => {
    const member = sharedMap.get("member");
    const workspace = sharedMap.get("workspace");

    if (!workspace || !workspace.id) {
        throw new Error("Workspace not found in shared map");
    }

    if (!member || !member.id) {
        throw new Error("Member not found in shared map");
    }

    // Get total used storage for the member
    const storage = await db.member.findUnique({
        where: { id: member.id },
        select: {
            storageBytes: true,
        },
    });

    if (!storage) {
        throw new Error("Storage information not found for member");
    }

    const limits = await db.workspace.findUnique({
        where: { id: workspace.id },
        select: {
            plan: {
                select: {
                    storageBytesPerSeat: true,
                },
            },
        },
    });

    if (!limits) {
        throw new Error("Storage limits not found for workspace");
    }

    return {
        storage,
        limits,
    };
});

export default component$(() => {
    const storageData = useStorage();
    return (
        <>
            <BackHeading>Storage Limits</BackHeading>
            <div class="flex w-full flex-col space-y-3">
                <div class="relative flex h-16 flex-row rounded-full bg-neutral-200">
                    <div
                        class="absolute top-0 bottom-0 left-0 h-full w-0 rounded-full bg-blue-600 transition-all duration-500 ease-in-out"
                        style={{
                            width: `${Math.min((Number(storageData.value.storage.storageBytes) / (Number(storageData.value.limits.plan.storageBytesPerSeat) || 1)) * 100, 100)}%`,
                        }}
                    />
                </div>
                <p class="px-5">You have used {Number(storageData.value.storage.storageBytes) / (1024 ** 3)} of {Number(storageData.value.limits.plan.storageBytesPerSeat) / (1024 ** 3)} GB</p>
            </div>
        </>
    );
});
