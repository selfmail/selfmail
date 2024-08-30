import { Context } from "hono";
import { config } from "../../config";

/**
 * handle an error
 * @param {string} error - your error in a short description
 */
export default function handleError(error: string) {
    if (config.LOG_ERRORS_INTO_CONSOLE) console.error(error);
    if (config.LOG_ERRORS_INTO_DB) {
        // TODO: log the error into the db
    }
}

/**
 * Manages the error and sends a response to the client.
 * @param {string} error - your error in a short description
 * @param {Context} c - the context from hono of the request
 */
export function handleErrorWithResponse(error: string, c: Context, code?: number, statusText?: string) {
    if (config.LOG_ERRORS_INTO_CONSOLE) console.error(error);
    if (config.LOG_ERRORS_INTO_DB) {
        // TODO: log the error into the db
    }
    return c.json({
        error: error,
    },
        {
            status: code ? code : 500,
            statusText: statusText ? statusText : "Internal server error",
        })
}