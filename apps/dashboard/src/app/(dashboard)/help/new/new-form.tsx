"use client"

import { useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { Button, EmailInput, Input, PasswordInput } from "ui"
import { z } from "zod"
import { createPost } from "./action"

export const initialState = {
    message: undefined,
    error: undefined
}

export default function NewForm() {
    const [error, setError] = useState<string | undefined>(undefined)
    const [state, formAction] = useFormState(createPost, initialState)
    const formDataSchema = z.object({
        title: z.string().min(3),
        description: z.string(),
        content: z.string().min(8).max(2048),
        allowComments: z.boolean()
    })
    const { pending } = useFormStatus()
    return (
        <form action={(e: FormData) => {
            console.log({
                title: e.get("title") as string,
                description: e.get("description") as string,
                content: e.get("content") as string,
                allowComments: e.get("allowComments")
            })
            setError(undefined)
            const clientParse = formDataSchema.safeParse({
                title: e.get("title") as string,
                description: e.get("description") as string,
                content: e.get("content") as string,
                allowComments: e.get("allowComments") === "on" ? true: false
            })
            if (!clientParse.success) {
                setError("Validation error. Please check the provided fields.")
                return
            }
            formAction(e)
        }} className="lg:w-[500px] flex flex-col space-y-2">
            <Input placeholder="Title" min={3} max={25} name="title" />
            <textarea placeholder="description" minLength={10} maxLength={250} name="description" />
            <textarea placeholder="content" minLength={100} maxLength={2048} name="content" />
            <div className="flex">
                <input type="checkbox" name="allowComments" id="allow-comments" />
                <label htmlFor="allow-comments">Allow comments?</label>
            </div>
            {
                error && <div className="text-red-500">{error}</div> ||
                state.error && <div className="text-red-500">{state.error}</div>
            }
            <div>
                <Button disabled={pending}>Create Post</Button>
            </div>
        </form>
    )
}