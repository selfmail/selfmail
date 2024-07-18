"use client"

import { Trash } from "lucide-react"
import { deletePost } from "./action"

export default function TrashButton({
    id
}: {
    id: string
}) {
    return (
        <Trash className="h-4 w-4 cursor-pointer text-red-400" onClick={async () => {
            await deletePost(id)
        }} />
    )
}