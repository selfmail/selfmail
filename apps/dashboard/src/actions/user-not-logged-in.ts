"use server"

import { getAuth } from "@/auth/cookie";
import { actionClient } from "./action";

/**User must be not logged in to perform the action. */
export const userNotLoggedIn = actionClient.use(async ({ next }) => {
    const { session } = await getAuth();

    if (session) {
        throw new Error('You are not allowed to perform this action. You must be logged out.');
    }

    return next({ ctx: { session } });
});