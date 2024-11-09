import { getAuth } from "@/auth/cookie"
import { TEmailData } from "@/components/cards/types"
import { db, Email } from "database"

export async function fetchEmails({ from, size, to }: { from: number, to: number, size: number }) {
    "use server"
    const { session } = await getAuth()
    if (!session) throw new Error("You are not allowed to perform this action. You must be logged in.")
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

export async function fetchSingleEmail({ id }: { id: string }) {
    "use server"
    const { session } = await getAuth()
    if (!session) throw new Error("You are not allowed to perform this action. You must be logged in.")
    const email = await db.email.findUnique({
        where: {
            id,
            user: {
                id: session.userId
            }
        }
    })

    if (!email) throw new Error("Email not found.")

    return email as Email
}