"use client"

import { Button } from "ui"
import { useMailStore } from "./store"
import { useState } from "react"
import { toast } from "sonner"
import { Pen } from "lucide-react"

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
                console.log(adresse, content, recipient, subject)
                toast.error("Some values are not defined.", {
                    description: "Content, Adresse, Recipient or subject are not defined."
                })
                return
            }
            const msg = await action({
                adresse,
                content,
                recipient,
                subject
            })
            if (msg) {
                toast.error("We had an internal server error.", {
                    description: msg
                })
                return
            }
            blancFields()
        }}>
            send
        </Button>
    )
}