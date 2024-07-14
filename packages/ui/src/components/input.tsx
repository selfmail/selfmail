"use client"

import { cn } from "../cn"

/**
 * The default text input.
 */
interface InputProps extends React.HTMLAttributes<HTMLInputElement> {
    placeholder?: string
}
function Input({placeholder, ...props}: InputProps) {
    return (
        <input type="text" placeholder={placeholder} className={cn("border-2 border-[#dddddddd] p-2 rounded-xl bg-[#f4f4f4] focus-visible:outline-none focus-visible:border-[#3775b8]", props.className)} {...props} />
    )
}
interface PasswordInputProps extends React.HTMLAttributes<HTMLInputElement> {
    placeholder?: string
}
function PasswordInput({...props}: PasswordInputProps) {
    return (
        <input type="password" className={cn("p-2 rounded-xl bg-[#f4f4f4] border-2 border-[#dddddddd] focus-visible:outline-none focus-visible:border-[#3775b8]", props.className)} {...props}/>
    )
}

function FileInput() {
    return (
        <input type="file" />
    )
}

function NumberInput() {
    return (
        <input type="number" />
    )
}

function UrlInput() {
    return (
        <input type="url" />
    )
}

export {Input, FileInput, NumberInput, PasswordInput, UrlInput, }