"use client"

import type { email } from "@/components/elements/table";
import DataTable from "@/components/elements/table";
import { create } from "zustand";

type State = {
    email: string | undefined
}
type Action = {
    setEmail: (state: State["email"]) => void
}

export const useEmailStore = create<State & Action>((set) => ({
    email: undefined,
    setEmail: (state) => set(() => ({ email: state }))
}));

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
    const { email, setEmail } = useEmailStore();
    return (
        <main className="flex">
            <div className="flex pt-3 flex-col lg:w-[50%] border-r border-r-border h-full min-h-screen overflow-y-auto">
                <DataTable
                    counter={counter}
                    action={action}
                />
                {/* <VirtualTable
                    counter={counter}
                /> */}
            </div>
            <div className="w-[50%] h-screen flex items-center justify-center overflow-y-auto">
                {
                    !email ? (
                        <h2 className="text-foreground-secondary text-3xl font-medium">No Email selected</h2>
                    ) : (
                        <div>
                            <h2 className="text-foreground-secondary text-3xl font-medium">Email selected {email}</h2>
                        </div>
                    )
                }
            </div>
        </main>
    );
}