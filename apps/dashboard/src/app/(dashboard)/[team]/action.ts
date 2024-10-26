// action to get the emails

import { email } from "@/components/elements/table";
import { getUser } from "@/lib/auth";
import { db } from "database";

export async function getEmails({ take, skip }: {
    take: number,
    skip: number
}): Promise<email[]> {
    "use server"

    const user = await getUser()

    const emails = await db.email.findMany({
        where: {
            userId: user.id,
        },
        select: {
            id: true,
            createdAt: true,
            subject: true,
            recipient: {
                select: {
                    email: true
                }
            },
            sender: {
                select: {
                    email: true
                }
            }
        },
        take,
        skip,
    })

    return emails
}