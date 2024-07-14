"use client"

import { Button, Input, PasswordInput } from "ui"

/**
 * This is the form for the register page.
 * This form is a client component, because
 * we need the return value of the server
 * action.
 */
export default function RegisterForm() {
    return (
        <form className="lg:w-[500px] flex flex-col space-y-2">
            <Input placeholder="hey" />
            <PasswordInput placeholder="password" />
            <Input placeholder="password" />
        </form>
    )
}