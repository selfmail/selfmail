import { createSafeActionClient } from "next-safe-action";


export const authActionClient = createSafeActionClient().use(async ({ next }) => {
    const currentUser = undefined

    if (!currentUser) {
        throw new Error("You are not allowed to create a user");
    }

    return next({ ctx: { user: currentUser } });
})