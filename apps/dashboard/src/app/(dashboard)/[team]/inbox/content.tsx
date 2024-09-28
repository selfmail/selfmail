"use client"

import type { email } from "@/components/elements/table";
import DataTable from "@/components/elements/table";
import { useEffect, useState } from "react";
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

export default function Content({ counter, action, getSingleEmail }: {
    counter: number,
    action: ({
        from,
        list
    }: {
        from: number,
        list: number
    }) => Promise<email[]>,
    getSingleEmail: (id: string) => Promise<email>
}) {
    const { email, setEmail } = useEmailStore();
    const [emailContent, setEmailContent] = useState<email | undefined>(undefined);
    useEffect(() => {
        async function fetchEmail() {
            const content = await getSingleEmail(email as string)
            setEmailContent(content)
        }
        fetchEmail()
    }, [email, getSingleEmail])
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
            {
                !email ? (
                    <div className="w-[50%] h-screen flex items-center justify-center overflow-y-auto">
                        <h2 className="text-foreground-secondary text-3xl font-medium">No Email selected</h2>
                    </div>
                ) : (
                    <div className="w-[50%] min-h-screen flex flex-col overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <p>{emailContent?.subject}</p>
                            <p>{emailContent?.createdAt.toLocaleDateString()}</p>
                        </div>
                        {emailContent?.sender}
                    </div>
                )
            }
        </main>
    );
}