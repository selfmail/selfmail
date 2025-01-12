"use client"

import { addId } from "@/stores/email-list.store";
import { useState } from "react";
import { Checkbox } from "ui/checkbox";
import { cn } from "ui/cn";
import { z } from "zod";


export default function EmailCard({
    content,
    tags,
    subject,
    ref,
    createdAt,
    preview,
    index,
    ...props
}: {
    id: string;
    content: string;
    subject: string | null;
    preview: string | null;
    plainText: string | null;
    createdAt: Date;
    tags: {
        id: string;
        name: string;
    }[];
    adress: {
        email: string;
        id: string;
    };
    sender: {
        email: string;
        id: string;
        name: string;
    };
    organization: {
        name: string;
        id: string;
    },
    index: number
} & React.ComponentProps<"div">) {
    const [checked, setChecked] = useState<boolean>(false)
    return (
        <div {...props} className={cn("w-full border-b border-b-border flex flex-col p-3 hover:bg-secondary transition", checked && "bg-neutral-50", props.className)}>
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Checkbox checked={checked} onClick={() => setChecked(!checked)} onCheckedChange={(e) => {
                        const parse = z.boolean().safeParse(e)
                        if (!parse.success) {
                            return
                        }
                        setChecked(parse.data)
                        addId(index)
                    }} className="h-4 w-4 rounded-[3px]" />
                    <h3 className="font-semibold">{subject}</h3>
                </div>
                <p>
                    {createdAt.toLocaleDateString()}
                </p>
            </div>
            <p>
                {(preview !== null ? preview.substring(0, 200) : content.substring(0, 200))}{(preview !== null && preview.length > 200) ? "..." : (preview === null && content.length > 200) ? "..." : ""}
            </p>
        </div>
    )
}