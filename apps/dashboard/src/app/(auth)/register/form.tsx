"use client"

import { useState } from "react"
import { useFormState } from "react-dom"
import { Button, EmailInput, Input, PasswordInput } from "ui"
import { z } from "zod"
import { login } from "./action"

export const initialState = {
    message: undefined,
    error: undefined
}
/**
 * This is the form for the register page.
 * This form is a client component, because
 * we need the return value of the server
 * action.
 */
export default function RegisterForm() {
    const [error, setError] = useState<string | undefined>(undefined)
    const [state, formAction] = useFormState(login, initialState)
    const formDataSchema = z.object({
        username: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(8).max(24),
        rePassword: z.string().min(8).max(24)
    })
    return (
        <form action={(e: FormData) => {
            setError(undefined)
            const clientParse = formDataSchema.safeParse({
                email: e.get("email"),
                password: e.get("password"),
                username: e.get("username"),
                rePassword: e.get("rePassword")
            })
            if (!clientParse.success) {
                setError("Validation error. Please check your email, your username and your password.")
                return
            }
            formAction(e)
        }} className="lg:w-[500px] flex flex-col space-y-2">
            <Input placeholder="Username" name="username" />
            <EmailInput placeholder="Email" name="email" />
            <PasswordInput placeholder="Password" name="password" />
            <PasswordInput placeholder="Repeat Password" name="rePassword" />
            {
                error && <div className="text-red-500">{error}</div>
            }
            <div>
                <Button>Register</Button>
            </div>
        </form>
    )
}