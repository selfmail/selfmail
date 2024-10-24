import { getIronSession, type SessionOptions } from "iron-session"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const getSession = async () => {
    const session = await getIronSession(cookies(), sessionOptions)

    if (!session) redirect("/login?redirectTo=")
}

export const login = async () => {

}

export const logout = async () => {

}

export const sessionOptions: SessionOptions = {
    cookieName: "selfmail-dashboard-session",
    password: process.env.SECRET_KEY || "",
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }
}