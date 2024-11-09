import { getAuth } from "@/auth/cookie"
import { TEmailData } from "@/components/cards/types"
import { db } from "database"

export async function fetchData({ from, to, size }: { from: number, to: number, size: number }) {
    "use server"

    if (from > to) {
        throw new Error("From must be less than to.")
    }

    if (size > 100) {
        throw new Error("Size must be less than 100.")
    }

    const { session } = await getAuth()

    if (!session) {
        throw new Error("No session found.")
    }

    const emails = await db.email.findMany({
        where: {
            user: {
                id: session.userId
            },
        },
        select: {
            id: true,
            subject: true,
            sender: true,
            createdAt: true,
            recipient: true,
        },
        take: size,
        skip: from,
    })

    let emailArray: TEmailData[] = emails.map(email => ({
        id: email.id,
        subject: email.subject,
        sender: email.sender.email,
        date: email.createdAt.toLocaleDateString(),
        destination: email.recipient.email,
    }))

    const count = await db.email.count({
        where: {
            user: {
                id: session.userId
            },
        },
    })

    return {
        meta: {
            totalRowCount: count
        },
        data: emailArray
    }
}