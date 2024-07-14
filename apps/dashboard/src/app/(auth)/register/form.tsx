"use client"

import { Button, EmailInput, Input, PasswordInput } from "ui"

/**
 * This is the form for the register page.
 * This form is a client component, because
 * we need the return value of the server
 * action.
 */
export default function RegisterForm() {
    return (
        <form className="lg:w-[500px] flex flex-col space-y-2">
            <Input placeholder="Username" />
            <EmailInput placeholder="Email" />
            <PasswordInput placeholder="Password" />
            <Input placeholder="Repeat Password" />
            <div>
                <Button>Register</Button>
            </div>
        </form>
    )
}