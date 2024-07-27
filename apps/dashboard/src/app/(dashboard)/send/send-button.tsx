"use client"

import { Button } from "ui"
import { useMailStore } from "./store"
import { useState } from "react"

export default function SendButton({
    action
}: {
    action: (mail: {
        adresse: string,
        content: string,
        recipient: string,
        subject: string,
    }) => Promise<void | string>
}) {
    const [error, setError] = useState<string | undefined>()

    const { adresse, content, recipient, subject, updateAdresse, updateContent, updateRecipient, updateSubject } = useMailStore()

    const blancFields = () => {
        updateAdresse(undefined)
        updateContent(undefined)
        updateRecipient(undefined),
        updateSubject(undefined)
    }
    return (
        <Button onClick={async() => {
            if (!(adresse && content && recipient && subject)){
                setError("Values not defined")
                return
            }
            const msg = await action({
                adresse,
                content,
                recipient,
                subject
            })
        }}>
            send
        </Button>
    )
}