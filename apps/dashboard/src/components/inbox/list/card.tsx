"use client"

import { cn } from "ui/cn";


export default function EmailCard({
    content,
    tags,
    subject,
    ref,
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
            {subject}
        </div>
    )
}