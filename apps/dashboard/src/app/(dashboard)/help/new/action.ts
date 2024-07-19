"use server"

import { checkRequest } from "@/server/checkRequest"
import { db } from "database"
import { redirect } from "next/navigation"
import { z } from "zod"

export async function createPost(initialState: unknown, e: FormData) : Promise<{
    error?: string,
    message?: string
}> {
    const formDataSchema = z.object({
        title: z.string().min(3),
        description: z.string(),
        content: z.string().min(8).max(2048),
        allowComments: z.boolean()
    })
    const serverParse = formDataSchema.safeParse({
        title: e.get("title") as string,
        description: e.get("description") as string,
        content: e.get("content") as string,
        allowComments: e.get("allowComments") === "on" ? true: false
    })
    if (!serverParse.success) throw new Error("Validation Error.")
    const {
        allowComments,
        content,
        description,
        title
    } = serverParse.data
    const req = await checkRequest()
    const user = await db.user.findUnique({
        where: {
            id: req.userId,
        }
    })
    if (!user) redirect("/login")
    const data = await db.helpPost.create({
        data: {
            content,
            description,
            title,
            allowComments,
            userId: user.id,
        }
    })
    // redirect the user to his/her post
    redirect(`/help/${data.id}`)
}