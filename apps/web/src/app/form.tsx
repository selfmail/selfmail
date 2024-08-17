"use client"

import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { Button, InputStyles } from "ui";
import { z } from "zod";
export default function Form({ action }: { action: (email: string) => Promise<undefined | string> }) {
    const [error, setError] = useState<string | undefined>(undefined);
    return (
        <div className="flex flex-col">
            <form className="relative flex items-center" action={async (e) => {
                const email = e.get("email") as string
                const schema = await z.string().email().safeParseAsync(email);
                if (!schema.success) {
                    toast.error("Could not validate email address");
                    setError("Could not validate email address");
                    return;
                }
                const msg = await action(schema.data)
                if (msg) {
                    toast.error(msg);
                    setError(msg);
                    return;
                }
                toast.success("You are now on the waitlist");
            }}>
                <input required type="email" placeholder="Your email" name="email" className={cn(InputStyles, "w-full")} />
                <Button type="submit" className="absolute right-2">
                    Send
                </Button>
            </form>
            <p className="text-red-500">
                {error}
            </p>
        </div>
    )
}