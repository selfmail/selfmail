"use client"
import { Button } from "ui";

export default function DeleteButton({
    action,
    id
}: {
    action: (id: string) => Promise<void | string>,
    id: string
}) {
    return (
        <Button variant={"danger"} onClick={ async () => {
            const msg = await action(id)
        }}>
            Delete
        </Button>
    )
}