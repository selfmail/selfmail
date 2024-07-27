"use client"

import { cn } from "lib/cn"
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "ui"
import TrashButton from "./trash-button"
import { Trash } from "lucide-react"
import { DeleteAdresse } from "./action"
import { useState } from "react"

/**
 * The card for the adresses on the `/adresse` page.
 */
export default function AdressCard({
    adresse,
    action
}: {
    adresse: {
        email: string,
        id: string,
        type: "main" | "second" | "spam",
        userId: string,
    },
    action: (id: string) => Promise<void | string>
}) {
    const [error, setError] = useState<string | undefined>(undefined)
    return (
        <div className="p-2 ring-1 items-center border-b border-b-[#666666] bg-[#f4f4f4] justify-between ring-[#666666] rounded-xl flex">
            <p>{adresse.email}</p>
            <div className="flex items-center space-x-2">
                <p className="text-red-500">
                    {error}
                </p>
                <Trash color="red" onClick={async () => {
                    const msg = await action(adresse.id)
                    if (!msg) window.location.reload()
                    if (msg) setError(msg)
                }} className="cursor-pointer h-4 w-4" />
                <Dialog>
                    <DialogTrigger>
                        <p className={cn(adresse.type === "main" && "text-green-700", adresse.type === "spam" && "text-red-700", adresse.type === "second" && "text-neutral-700")}>
                            {adresse.type}
                        </p>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            Types of adresses
                        </DialogHeader>
                        <DialogDescription>
                            As you may already noticed, adresses have a "type". The type indicates which adresse this is, for example the "main adresse" is the adresse, which you
                            choosed when you registered you. This is also the only adress, which is able to authenticate you. The type "second" is for normal adresses, and the type "spam"
                            for adresses of spam inboxes.
                        </DialogDescription>
                        <DialogFooter>
                            <DialogClose>
                                <Button>
                                    Ok, perfect
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <TrashButton />
            </div>
        </div>
    )
}