"use server"

import { db } from "database"

export async function deletePost(id: string) {
    const del = await db.helpPost.delete({
        where: {
            id
        }
    })
}