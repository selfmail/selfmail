import type { email } from "@/components/elements/table";
import { checkRequest } from "@/server/checkRequest";
import { db } from "database";

export async function getEmail({
    from,
    list
}: {
    from: number,
    list: number
}) {
    "use server"

    const req = await checkRequest();

    const emails = await db.email.findMany({
        where: {
            userId: req.userId,
        },
        select: {
            id: true,
            createdAt: true,
            subject: true,
            sender: true,
            recipient: true,
        },
        take: list,
        skip: from
    })

    return emails as email[]
}