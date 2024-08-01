"use client"

import { cn } from "lib/cn";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Button } from "ui";
import { create } from "zustand";


type email = {
    id: string;
    sender: string;
    subject: string;
    recipient: string;
    createdAt: Date;
}

// zustand store for the ids from the checked emails
type state = {
    id: string[],
}

type action = {
    setId: (state: state["id"]) => void
}

/**A store for the ids of the checked emails*/
export const useIds = create<state & action>((set) => ({
    id: [],
    setId: async (state) => {
        set(() => ({ id: state }))
    },
}))

/**
 * The table component, here are all of your mails.
 * You can filter and sort the mails.
 * @param data - an array of mails
 * @returns {JSX.Element}
 */
export default function DataTable({ data, pagniation }: { data: email[], pagniation: /* Steps of the pagniation */ {first: number, last: number, difference: number} }): JSX.Element {
    const { id, setId } = useIds()
    const emails = useMemo(() => data, [data])
    const router = useRouter()
    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <h2 className="text-3xl font-medium mx-3 ">Your Inbox</h2>
                </div>
                <div className="flex space-x-2 items-center mr-2">
                    {id.length > 0 && <>
                        <Button variant={"secondary"} onClick={() => {
                            for (const i of id) {
                                (document.getElementById(i) as HTMLInputElement).checked = false
                            }
                            setId([])
                        }}>Clear Selection</Button>
                        <Button onClick={() => {
                        }} variant="danger">Delete</Button>
                    </>}
                </div>
            </div>

            <div className="overflow-x-auto">
                {emails.length > 0 && emails.map((email) => (
                    <div key={email.id} className={cn("hover:bg-gray-100 border-t-2 relative border-t-[#cccccc] p-2 cursor-pointer w-full flex justify-between items-center", (id.includes(email.id) && "bg-gray-100"))} >
                        <input type="checkbox" id={email.id} className="h-4 w-4 mr-3 z-20" onClick={() => {
                            setId(id.includes(email.id) ? id.filter(id => id !== email.id) : [...id, email.id])
                        }} />
                        <p onClick={() => router.push(`/contacts/${email.sender}`)} onKeyDown={() => router.push(`/contacts/${email.sender}`)}>{email.sender}</p>
                        <p>{email.subject}</p>
                        <p>{email.createdAt.toLocaleDateString()}</p>
                        {/* The background div for going to the mail page */}
                        <div className="absolute inset-0 " onClick={() => {
                            router.push(`/email/${email.id}`)
                        }} onKeyDown={() => {
                            router.push(`/email/${email.id}`)
                        }} />
                    </div>
                )) || (
                        <div className="text-[#666666] mx-3 flex items-center space-x-2"><span className="h-2 w-2 rounded-full bg-neutral-400 animate-pulse" /><p>We are listening on emails for you...</p></div>
                    )}
            </div>
            { emails.length > 0 && (
                <hr className="border-t-2 border-[#cccccc]" />
            )}
        </div>
    )
}