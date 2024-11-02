

import { getAuth } from "@/auth/cookie";
import { actionClient, ActionError } from "./action";

/**User must be not logged in to perform the action. */
export const userNotLoggedIn = actionClient.use(async ({ next }) => {
    const { session, user } = await getAuth();
    console.error(`This is the session: ${session}`)
    if (session && user) {
        throw new Error("User already logged in")
    }

    if (session || user) throw new ActionError("You are not allowed to perform this action. You must not be logged out.");
    console.log("no session")
    return next();
});