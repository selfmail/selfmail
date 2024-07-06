"use server"

export async function ResetPassword(prev: unknown, e: FormData): Promise<{message: string | undefined, error: string | undefined}> {
    return {
        error: undefined,
        message: "all checks are gone."
    }
}