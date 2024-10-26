import { db } from "database"
import { getIronSession, IronSession, type SessionOptions } from "iron-session"
import { cookies } from "next/headers"
import { redirect as redirectNext } from "next/navigation"

interface Session {
    userId: string,
    username: string,
}

export const getSession = async (options?: { redirect?: boolean, returnUser?: boolean, checkDB: boolean }) => {


    const { redirect, returnUser, checkDB } = options || {}

    if (!checkDB && returnUser) {
        throw new Error("Cannot return user without checking the database")
    }

    // get the session from the cookies
    const session = await getIronSession<Session>(cookies(), sessionOptions)

    if (checkDB) {
        const user = await db.user.findUnique({
            where: {
                id: session.userId
            }
        })

        if (!user && redirect) {
            redirectNext("/login")
        }

        if (returnUser) {
            return user
        }
    }

    if (!session && redirect) {
        redirectNext("/login")
    }

    return session
}

export const getUser = async () => {
    const session = await getIronSession<Session>(cookies(), sessionOptions)

    const user = await db.user.findUnique({
        where: {
            id: session.userId
        }
    })

    if (!user) redirectNext("/login")

    return user
}

export type IronSessionType = IronSession<Session>

export const changeSession = async ({
    userId,
    username
}: {
    userId: string,
    username: string,
}) => {
    // set the session in the cookies
    const session = await getSession() as IronSessionType

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
