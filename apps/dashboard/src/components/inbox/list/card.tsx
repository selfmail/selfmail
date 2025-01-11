"use client"

import { cn } from "ui/cn";


export default function EmailCard({
    content,
    tags,
    subject,
    ref,
    createdAt,
    preview,
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
} & React.ComponentProps<"div">) {
    return (
        <div {...props} className={cn("w-full border-b border-b-border flex flex-col p-3 hover:bg-secondary transition", props.className)}>
            <div className="flex w-full items-center justify-between">
                <h3 className="font-semibold">{subject}</h3>
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