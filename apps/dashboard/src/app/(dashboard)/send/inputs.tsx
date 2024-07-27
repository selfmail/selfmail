"use client"

import { Input } from "ui"
import { useMailStore } from "./store"

export default function HeaderInputs() {
    const { updateSubject, updateRecipient, recipient, subject } = useMailStore()

    return (
        <>
            <Input placeholder="Subject..." value={subject} onChange={(e)  => updateSubject(e.currentTarget.value === ""? undefined: e.currentTarget.value)} className="border p-2 mt-2 border-t-[#d1d1d1] border-t-2 border-b-2 border-b-[#d1d1d1] outline-none bg-transparent" />
            <Input placeholder="Recipient..." value={recipient} onChange={(e)  => updateRecipient(e.currentTarget.value === ""? undefined: e.currentTarget.value)} className="border p-2 mb-2 border-b-2 border-b-[#d1d1d1] outline-none bg-transparent" />
        </>
    )
}