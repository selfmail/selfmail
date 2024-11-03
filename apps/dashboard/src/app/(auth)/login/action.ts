"use server"

import { ActionError } from "@/actions/action";
import { userNotLoggedIn } from "@/actions/user-not-logged-in";
import { setSessionCookie } from "@/auth/cookie";
import { verifyPasswordHash } from "@/auth/password";
import { createSession, generateRandomSessionToken } from "@/auth/session";
import { db } from "database";
import { redirect } from "next/navigation";
import { z } from "zod";

const signInSchema = z
    .object({
        email: z.string().email().endsWith("@selfmail.app", "Only @selfmail.app adresses are allowed"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
    })

export const loginUser = userNotLoggedIn.schema(signInSchema).action(async ({ parsedInput: { email, password, username } }) => {
    // get the user
    const user = await db.user.findFirst({
        where: {
            username,
        },
    });

    if (!user) {
        throw new ActionError("User not found.")
    }


    if (!await verifyPasswordHash(user.password, password)) {
        throw new ActionError("Incorrect password.")
    }

    // check the email
    const address = await db.address.findFirst({
        where: {
            email,
        },
        include: {
            user: true,
        },
    });

    if (!address) {
        throw new ActionError("Email not found.")
    }

    if (address.userId !== user.id) {
        throw new ActionError("Email not found.")
    }

    // create a new session
    const sessionToken = generateRandomSessionToken()
    const session = await createSession(sessionToken, user.id);
    if (!session.userId) throw new ActionError("Error creating the session.")
    await setSessionCookie(sessionToken, session.expiresAt)


    redirect("/")
})