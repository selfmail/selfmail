import { getIronSession, type SessionOptions } from "iron-session"
import { cookies } from "next/headers"

interface Session {
    userId: string,
    username: string,
}

export const getSession = async () => {
    // get the session from the cookies
    const session = await getIronSession<Session>(cookies(), sessionOptions)
    return session
}

export const changeSession = async ({
    userId,
    username
}: {
    userId: string,
    username: string,
}) => {
    // set the session in the cookies
    const session = await getSession()

    session.userId = userId
    session.username = username

    await session.save()

}

export const sessionOptions: SessionOptions = {
    cookieName: "selfmail-dashboard-session",
    password: process.env.SECRET_KEY || "",
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }
}