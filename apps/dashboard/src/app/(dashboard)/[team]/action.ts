import { getAuth } from "@/auth/cookie"
import { db } from "database"

export async function fetchUserDetails({ team }: { team: string }) {
    "use server"
    const { session } = await getAuth()

    if (!session) throw new Error("You are not allowed to perform this action. You must be logged in.")

    const user = await db.user.findUnique({
        where: {
            id: session.userId
        }
    })

    if (!user) throw new Error("User not found.")

    return user
}