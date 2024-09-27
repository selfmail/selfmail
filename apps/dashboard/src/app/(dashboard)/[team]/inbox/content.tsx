"use client"

import type { email } from "@/components/elements/table";
import VirtualTable from "@/components/elements/virtual-table";

export default function Content({ counter, action }: {
    counter: number,
    action: ({
        from,
        list
    }: {
        from: number,
        list: number
    }) => Promise<email[]>
}) {
    return (
        <main className="flex">
            <div className="flex pt-3 flex-col lg:w-[50%] border-r border-r-border h-full min-h-screen overflow-y-auto">
                {/* <DataTable
                    counter={counter}
                    action={action}
                /> */}
                <VirtualTable
                    counter={counter}
                />
            </div>
            <div className="w-[50%] h-screen flex items-center justify-center overflow-y-auto">
                <h2 className="text-foreground-secondary text-3xl font-medium">No Email selected</h2>
            </div>
        </main>
    );
}