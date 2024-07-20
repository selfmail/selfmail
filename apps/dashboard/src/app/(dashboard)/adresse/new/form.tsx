"use client"

import { useState } from "react"
import { useFormState } from "react-dom"
import { Button, EmailInput, Input } from "ui"
import { CreateAdresse } from "./action"
import { z } from "zod"

const initialState = {
    message: undefined,
    error: undefined
}

export default function NewAdresseForm() {
    const [error, setError] = useState<string | undefined>(undefined)
    const [state, formAction] = useFormState(CreateAdresse, initialState)
    const adresseSchema = z.object({
        email: z.string().email().endsWith("@selfmail.app"),
        type: z.enum(["second", "spam"])
    })
    return (
        <form className="lg:w-[400px]" action={async (e) => {
            setError(undefined)
            console.log(e.get("second") && "second" || e.get("spam") && "spam")
            const parse = await adresseSchema.safeParseAsync({
                email: e.get("email"),
                type: e.get("second") && "second" || e.get("spam") && "spam"
            })
            if (!parse.success) {
                setError("We had an error when parsing the provided fields. Please check your inputs!")
                return
            }
            formAction(e)
        }}>
            <EmailInput required className="w-full" placeholder="You adresse" name="email" />
            <div className="flex flex-col">
                <h3 className="text-xl">Type</h3>
                <div className="space-x-2 flex items-center">
                    <input type="radio" name="second" id="second" />
                    <label htmlFor="second">Second</label>
                </div>
                <div className="flex space-x-2 items-ceter">
                    <input type="radio" name="spam" id="spam" />
                    <label htmlFor="spam">Spam</label>
                </div>
            </div>
            {
                state.error && (
                    <p className="text-red-700 mt-2">{state.error}</p>
                ) || error && (
                    <p className="text-red-700 mt-2">{error}</p>
                )
            }
            <div className="mt-2">
                <Button type="submit">
                    Submit
                </Button>
            </div>
        </form>
    )
}