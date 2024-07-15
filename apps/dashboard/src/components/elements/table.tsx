"use client"

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
export default function Table({ data }: { data: email[] }): JSX.Element {
    const { id, setId } = useIds()
    const emails = useMemo(() => data, [data])
    useEffect(() => {
        console.log(id)
    }, [id])
    return (
        <div>
            <div className="flex">
                {id.length > 0 && <>
                    <Button onClick={() => {
                        for (const i of id) {
                            (document.getElementById(i) as HTMLInputElement).checked = false
                        }
                        setId([])
                    }}>Clear</Button>
                    <Button onClick={() => {
                        setId([])
                    }} variant="danger">Delete</Button>
                </>}
            </div>
            <table>
                <tbody>
                    {emails.map((email) => (
                        <tr key={email.id}>
                            <input type="checkbox" name="" id={email.id} className="h-4 w-4 mr-3" onClick={() => {
                                setId(id.includes(email.id) ? id.filter(id => id !== email.id) : [...id, email.id])
                            }} />
                            <td>{email.sender}</td>
                            <td>{email.subject}</td>
                            <td>{email.createdAt.toString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}