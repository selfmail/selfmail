import { getAuth } from "@/auth/cookie";
import { actionClient, ActionError } from "./action";

/**User must be not logged in to perform the action. */
export const userNotLoggedIn = actionClient.use(async ({ next }) => {
    const { session, user } = await getAuth();

    if (session && user) {
        throw new ActionError("User already logged in. Please log out.")
    }

    if (session || user) throw new ActionError("You are not allowed to perform this action. You must not be logged out.");
    return next();
});