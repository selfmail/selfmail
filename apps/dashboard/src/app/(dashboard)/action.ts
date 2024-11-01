"use server"

import { getUser } from "@/lib/auth"
import { db } from "database"

export async function getTeams() {
    const user = await getUser()

    const teams = await db.team.findMany({
        where: {
            members: {
                some: {
                    id: user.id
                }
            }
        },
        select: {
            id: true,
            name: true,
        },
    })

    return teams
} 