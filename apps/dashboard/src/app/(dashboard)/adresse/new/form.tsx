"use client"

import { Button, EmailInput, Input } from "ui"

export default function NewAdresseForm() {
    return (
        <form>
            <EmailInput placeholder="You adresse" />
            <div>
                <Button type="submit">
                    Submit
                </Button>
            </div>
        </form>
    )
}