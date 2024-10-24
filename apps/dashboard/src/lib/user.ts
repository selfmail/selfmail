// get basic informations about the current user

import { getSession } from "./auth"

export const getUsername = async () => {
    const currentUser = await getSession()

    return currentUser.username
}