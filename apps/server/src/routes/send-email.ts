import { db } from "database";
import type { SendMessage } from "postal-js";
import { z } from "zod";
import { app } from "..";
import { handleErrorWithResponse } from "../actions/handleError";
import { postal } from "../postal";

/**
 * Send a new email with the API.
 * This is the default export, which
 * will later be used in the index.ts at `src/`.
 */
export default function SendEmail() {
  // TODO: add authentication
  app.post(
    "/email/send",
    async (c) => {
      const body = await c.req.json() as SendMessage

      // parse the provided fields
      const emailSchema = await z
        .object({
          plain_body: z.string().optional(),
          html_body: z.string().optional(),
          subject: z.string().optional(),
          from: z.string(),
          to: z.array(z.string().email()).optional(),
          cc: z.array(z.string().email()).optional(),
          bcc: z.array(z.string().email()).optional(),
          reply_to: z.string().email().optional(),
          headers: z.record(z.string()).optional(),
          attachments: z.array(z.string()).optional(),
          tag: z.string().optional(),
          sender: z.string().email().optional(),
          bounce: z.boolean().optional(),
        })
        .safeParseAsync({
          ...body
        });

      // The provided values are not matching the required types, an error will be send back.
      if (!emailSchema.success) {
        handleErrorWithResponse("Validation of the fields is failed", c, 400, "Required fields are not valid or have a wrong schema.");
        return
      }
      const { from, attachments, to, cc, bcc, reply_to, headers, tag, bounce, plain_body, html_body, subject, sender } = emailSchema.data;

      // checking if the sender is in the db
      const adresse = await db.adresse.findUnique({
        where: {
          email: from,
        },
      });

      // adresse is not defined in the database
      if (!adresse) {
        handleErrorWithResponse("Sender is not defined in the database", c, 400, "There was an error in the db: we can't find the sender in the db.");
      }

      // checks done, send the email
      const msg = await postal.sendMessage({
        attachments,
        bcc,
        cc,
        from,
        bounce,
        html_body,
        plain_body,
        reply_to,
        subject,
        to,
        sender,
        tag
      });

      if (!msg.success) {
        handleErrorWithResponse(`Could not send email to the recipient: \n\n${msg.data.message}`, c);
        return
      }

      // TODO: When the email was sent without an error, the contact should be updated
      return c.json(
        {
          message: "Send the email successfully",
        },
        {
          status: 200,
          statusText: "OK",
        },
      );
    },
  );

}