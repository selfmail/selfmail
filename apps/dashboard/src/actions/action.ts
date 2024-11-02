import { createSafeActionClient } from 'next-safe-action';

export class ActionError extends Error { }

export const actionClient = createSafeActionClient({
    handleServerError: (error) => {
        console.log(error)
        if (error instanceof ActionError) {
            return error.message;
        }

        return 'We are sorry, something went wrong';

    },
    throwValidationErrors: true,
});