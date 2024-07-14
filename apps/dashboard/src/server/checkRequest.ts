import type { Session } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia } from "./lucia";

/**Validate the request and if there's no user, redirect to the login page. */
export const checkRequest = async () => {
    const sessionCookie = cookies().get("Set-Cookie")?.value
    let session: Session | null = null
    if (sessionCookie) {
        const sessionId = lucia.readSessionCookie(sessionCookie);

        const data = await lucia.validateSession(sessionId || "");
        session = data.session
    }
    if (!session) redirect("/login")
    return session;
};