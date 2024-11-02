"use server"

import { getAuth } from "@/auth/cookie";
import { actionClient } from "./action";

/**User must be logged in to perform the action. */
export const userLoggedIn = actionClient.use(async ({ next }) => {
    const { session } = await getAuth();

    if (!session) {
        throw new Error('You are not allowed to perform this action. You must be logged in.');
    }

    return next({ ctx: { session } });
});