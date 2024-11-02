"use server"

import { userNotLoggedIn } from "@/actions/user-not-logged-in";
import { createSession, generateRandomSessionToken } from "@/auth/session";
import { db } from "database";
import { z } from "zod";

const signInSchema = z
    .object({
        email: z.string().email().endsWith("@selfmail.app", "Only @selfmail.app adresses are allowed"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
    })

export const loginUser = userNotLoggedIn.schema(signInSchema).action(async ({ parsedInput: { email, password, username }, ctx }) => {
    // user not logged in, perform login

    // get the user
    const user = await db.user.findFirst({
        where: {
            username,
        },
    });

    if (!user) {
        return { error: "User not found" };
    }

    // create a new session
    const sessionToken = generateRandomSessionToken()
    const session = await createSession(sessionToken, user.id);



})