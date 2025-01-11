// This is the component to view an email
"use client"

import { Spinner } from "ui/spinner"

export default function View() {
    return (
        <div className="w-full border-l border-l-border flex items-center justify-center h-full">
            <Spinner />
        </div>
    )
}