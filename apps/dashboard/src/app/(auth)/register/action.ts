"use server"
import { userNotLoggedIn } from "@/actions/user-not-logged-in";
import { hashPassword } from "@/auth/password";
import { createSession, generateRandomSessionToken } from "@/auth/session";
import { createId } from "@paralleldrive/cuid2";
import { db } from "database";
import { z } from "zod";

const signUpSchema = z
    .object({
        email: z.string().email().endsWith("@selfmail.app", "Only selfmail adresses are allowed"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
        confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })

export const registerUser = userNotLoggedIn.schema(signUpSchema).action(async ({ parsedInput: { email, password, username, confirmPassword }, ctx }) => {
    if (password !== confirmPassword) {
        return "Passwords don't match"
    }

    // register user
    const user = await db.user.create({
        data: {
            username,
            id: createId(),
            password: await hashPassword(password),
        },
    })

    if (!user) return {
        error: "Error creating the user."
    }

    // Create a new personal team
    const team = await db.team.create({
        data: {
            id: createId(),
            name: username,
            ownerId: user.id,
            teamType: "personal",
        },
    })

    if (!team) return "Error creating the personal team."

    // Create a new address
    const address = await db.address.create({
        data: {
            id: createId(),
            userId: user.id,
            teamId: team.id,
            addressId: createId(),
            email,
        },
    })

    if (!address) return "Error creating main the address."

    // create the session
    const session = await createSession(generateRandomSessionToken(), user.id)

    if (!session) return "Error creating the session."

    return
})