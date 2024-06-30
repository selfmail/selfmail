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
     * 
     * @param token - the bearer auth token
     * 
     * @param content - the email content
     * @param subject - the email subject
     * @param sender - the sender of this email
     * @param recipient - the recipient of this emai
     * 
     * TODO: add documentation link
     * @see
     */
    app.post("/email/receive", async (c) => {
        /**
         * Parsed body from hono. You can get now the provided email fields.
         */
        const body = await c.req.parseBody()

        /**The email subject.
         * 
         * [see on google](https://www.google.com/search?q=what+is+an+email+subject&oq=what+is+an+email+subject&sourceid=chrome&ie=UTF-8)
         */
        const subject: string = body.subject as string

        /**
         * The Email content.
         */
        const content: string = body.content as string

        /**
         * The sender of the email.
         */
        const sender: string = body.sender as string

        /**
         * The recipient of the email. Usefull when you use multiple adresses or domains.
         */
        const recipient: string = body.recipient as string

        /**
         * Parsing the provided fields with zod, to make sure, we can working with the variables.
         */
        const emailSchema = z.object({
            content: z.string(),
            sender: z.string().email(),
            subject: z.string(),
            recipient: z.string().email()
        }).safeParse({
            subject,
            content,
            sender,
            recipient
        })

        // The provided values are not matching the required types, an error will be send back.
        if (!emailSchema.success) {
            return c.json({
                error: "Typeerror: cannot parse the required fields"
            }, {
                status: 400,
                statusText: "Required fields are not valid or have a wrong schema."
            })
        }

        /*All is going correctly, send the 200 status code back */
        return c.json({
            error: undefined
        }, {
            status: 200,
            statusText: "All is processing correctly."
        })
    })
}