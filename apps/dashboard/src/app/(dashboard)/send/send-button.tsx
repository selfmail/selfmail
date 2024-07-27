"use client"

import { Button } from "ui"

export default function Send({
    action
}: {
    action: (mail: {
        adresse: string,
        content: string,
        recipient: string,
        subject: string,
    }) => Promise<void | string>
}) {
    return (
        <Button>
            send
        </Button>
    )
}