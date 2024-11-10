"use client"

import { useEmailStore } from "@/components/active-email"
import { LegacyRef } from "react"
import { useCardSelectionStore } from "./index"

export default function Card({
    subject,
    ref,
    sender,
    date,
    id
}: {
    subject: string,
    ref?: LegacyRef<HTMLDivElement>,
    sender: string,
    date: string,
    id: string
}) {
    const { setEmailId } = useEmailStore()
    const { ids, setIds } = useCardSelectionStore()
    return (
        <div ref={ref} className="flex flex-col gap-2 p-4 cursor-pointer hover:bg-background-secondary transition-colors" onClick={() => setEmailId(id)}>
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <input onSelect={() => setIds([...ids, id])} type="checkbox" className="w-4 h-4 border-border rounded-full" />
                    <p className="text-sm text-text-secondary">{sender}</p>
                </div>
                <p className="text-sm text-text-secondary">{date}</p>
            </div>
            <div className="flex">
                <h3 className="text-text text-base">{subject}</h3>
            </div>
        </div>
    )
}