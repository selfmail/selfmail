// sidebar view for the active email
"use client"

import type { Email } from "database"
import { useEffect, useState } from "react"
import { create } from "zustand"

type State = {
    emailId: string | undefined
}

type Action = {
    setEmailId: (ids: State['emailId']) => void
}

export const useEmailStore = create<State & Action>((set) => ({
    emailId: undefined,
    setEmailId: (emailId) => set(() => ({ emailId: emailId })),
}))

export default function ActiveEmailView({
    fetchSingleEmail
}: {
    fetchSingleEmail: ({ id }: { id: string }) => Promise<Email>
}) {
    const { emailId, setEmailId } = useEmailStore()
    const [email, setEmail] = useState<Email | undefined>()

    async function handleFetchEmail() {
        const email = await fetchSingleEmail({ id: emailId! })
        setEmail(email)
    }

    useEffect(() => {
        if (emailId) {
            handleFetchEmail()
        }
    }, [emailId])

    return (
        <div className="flex items-center justify-center w-[50%]">
            {!email && <p className="text-sm text-text-secondary">No email selected.</p>}
        </div>
    )
}

