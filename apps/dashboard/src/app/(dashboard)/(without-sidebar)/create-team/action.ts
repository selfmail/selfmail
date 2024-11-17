import { ActionError } from "@/actions/action";
import { userLoggedIn } from "@/actions/user-logged-in";
import { db } from "database";
import { z } from "zod";

const schema = z.object({
    name: z.string().min(3).max(50),
    description: z.string().min(3).max(250),
    teamType: z.enum(["personal", "business"])
})

export const createTeam = userLoggedIn.schema(schema).action(async ({ ctx: { session }, parsedInput: { name, description, teamType } }) => {
    const team = await db.team.create({
        data: {
            name,
            description,
            ownerId: session.userId,
            teamType
        }
    })

    if (!team) throw new ActionError("Failed to create team")

    return team.id
})