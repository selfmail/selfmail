import { app } from "..";
import {z} from "zod"

/**
 * Handle the Email related routes.
 * 
 * On this file:
 * - receive an email
 * - send an email
 * - delete an email
 * - archive an email
 */
export default function Email() {

    /**
     * Receive an email with this post endpoint.
     * @param token - the bearer auth token
     * @param content - the email content
     * @param subject - the email subject
     * 
     * TODO: add documentation link
     * @see
     */
    app.post("/email/receive", (c) => {
        const body = c.body

        /*All is going correctly, send the 200 status code back */
        return c.json({
            error: undefined
        }, {
            status: 200,
            statusText: "All is processing correctly."
        })
    })
}