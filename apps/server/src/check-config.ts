import { config } from "../config";

/**
 * This is a function to check if the config is correct.
 * If the config is not correct, the server will not start and an error will be thrown.
 */
export default function CheckConfig() {
    if (!config.RESEND) {
        throw new Error("RESEND is not defined in the .env file")
    }

    if (!config.SUPPORT_MAIL) {
        throw new Error("SUPPORT_MAIL is not defined in the .env file")
    }
}