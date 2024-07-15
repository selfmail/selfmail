"use server"
import { lucia } from "@/server/lucia"
import bcrypt from "bcrypt"
import { db } from "database"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
const formDataSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8).max(24)
})

export async function register(prevState: unknown, e: FormData): Promise<{
    message?: string,
    error?: string
}> {
    
    const email = e.get("email") as string
    const password = e.get("password") as string
    const username = e.get("username") as string

    const parse = formDataSchema.safeParse({
        email,
        password,
        username
    })
    if (!parse.success) {
        return {
            message: undefined,
            error: "Validation error. Check your email or your password."
        }
    }
    if (!email.endsWith("@selfmail.app")) return {
        message: undefined,
        error: "Invalid email. Your email must end with @selfmail.app. You can choose your own handle."
    }
    // checks if the user is already registered
    const checkUser = await db.user.findUnique({
        where: {
            email,
            username
        },
    })

    if (checkUser) return {
        message: undefined,
        error: "User already registered. Please login."
    }

    // create the user
    const user = await db.user.create({
        data: {
            email,
            username,
            password: await bcrypt.hash(password, 10),
        }
    })
    
    // all checks done, now the authentication logic
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies().set("Set-Cookie", sessionCookie.serialize())

    redirect("/")
}