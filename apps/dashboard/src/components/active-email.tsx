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
        <>
            {email && (
                <div className="flex flex-col w-[50%] divide-y divide-border">
                    <div className="h-12 flex justify-between items-center px-4 py-2">
                        <p>{email.subject}</p>
                        <p>{email.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div>

                    </div>
                </div>
            )}

            {email?.id !== emailId || emailId && !email && (
                <div className="flex items-center justify-center w-[50%]">
                    <p>hey</p>
                </div>
            )}
        </>
    )
}

