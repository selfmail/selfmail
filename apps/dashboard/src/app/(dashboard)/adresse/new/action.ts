"use server"

/**
 * Create a new adress with the given arguments.
 * @param {string} email - the email of this new adresse 
 * @param {"spam" | "second"} type 
 */
export async function CreateAdresse(
    prevState: unknown,
    e: FormData
): Promise<{
    error: string | undefined,
    message: string | undefined
}> {
    return {
        message: "All ok",
        error: undefined
    }
}