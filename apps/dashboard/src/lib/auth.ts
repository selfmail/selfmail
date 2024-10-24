import { getIronSession, type SessionOptions } from "iron-session"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

interface Session {
    userId: string,
    username: string,
}

export const getSession = async () => {
    // get the session from the cookies
    const session = await getIronSession<Session>(cookies(), sessionOptions)

    if (!session) redirect("/login?redirectTo=")

    return session
}

export const sessionOptions: SessionOptions = {
    cookieName: "selfmail-dashboard-session",
    password: process.env.SECRET_KEY || "",
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }
}