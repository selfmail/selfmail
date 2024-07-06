"use client"

import { ResetPassword } from "@/app/(auth)/reset-password/action"
import { useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { Button, Input } from "ui"
export const initialState = {
    error: undefined,
    message: undefined
}
export default function ResetPasswordForm() {
    const [error, setError] = useState<string | undefined>(undefined)
    const [state, formAction] = useFormState(ResetPassword, initialState)
    const {pending} = useFormStatus()
    return (
        <form action={async (e) => {
            // client side form validation to prevent spam
            formAction(e)
        }}>
            <Input  />
            <Input  />
            <Button type="submit">
                Submit
            </Button>
        </form>
    )
}