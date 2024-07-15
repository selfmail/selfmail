"use client"

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Button } from "ui";
import { create } from "zustand";


type email = {
    id: string;
    content: string;
    sender: string;
    subject: string;
    recipient: string;
    createdAt: Date;
    userId: string;
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
export default function DataTable({ data }: { data: email[] }): JSX.Element {
    const { id, setId } = useIds()
    const emails = useMemo(() => data, [data])
    useEffect(() => {
        console.log(id)
    }, [id])
    const router = useRouter()
    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="flex items-center ml-2">
                    <input type="checkbox" className="h-4 w-4 mr-3" />
                    <h2 className="text-3xl font-medium mx-3 ">Your Inbox</h2>
                </div>
                <p>accounts</p>
            </div>
            <div className="flex">
                {id.length > 0 && <>
                    <Button onClick={() => {
                        for (const i of id) {
                            (document.getElementById(i) as HTMLInputElement).checked = false
                        }
                        setId([])
                    }}>Clear</Button>
                    <Button onClick={() => {
                    }} variant="danger">Delete</Button>
                </>}
            </div>
            <div className="overflow-x-auto">
                {emails.length > 0 && emails.map((email) => (
                    <div key={email.id} className="hover:bg-gray-100 border-t-2 relative border-t-[#cccccc] p-2 cursor-pointer w-full flex justify-between items-center" >
                        <input type="checkbox" id={email.id} className="h-4 w-4 mr-3 z-20" onClick={() => {
                            setId(id.includes(email.id) ? id.filter(id => id !== email.id) : [...id, email.id])
                        }} />
                        <p>{email.sender}</p>
                        <p>{email.subject}</p>
                        <p>{email.createdAt.toLocaleDateString()}</p>
                        {/* The background div for going to the mail page */}
                        <div className="absolute inset-0 " onClick={() => {
                            router.push(`/mail/${email.id}`)
                        }} onKeyDown={() => {
                            router.push(`/mail/${email.id}`)
                        }} />
                    </div>
                )) || (
                        <p className="text-[#666666]">You have no emails received yet.</p>
                    )}
            </div>
        </div>
    )
}