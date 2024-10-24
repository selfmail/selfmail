import { createSafeActionClient } from "next-safe-action";
import { getSession } from "../auth";

// user is signed in
export const authActionClient = createSafeActionClient().use(async ({ next }) => {
    const currentUser = await getSession()

    if (!currentUser.userId) {
        throw new Error("You are not allowed to create a user");
    }

    // TODO: further checks inside of the database

    return next({ ctx: { user: currentUser } });
})

// user is not signed in
export const notAuthenticatedClient = createSafeActionClient().use(async ({ next }) => {
    const currentUser = await getSession()

    if (currentUser.userId) {
        throw new Error("You are not allowed to create a user.");
    }

    return next({ ctx: { user: currentUser } });
})