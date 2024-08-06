import { z } from "zod";
import { app } from "..";
import { db } from "database";
import { config } from "../../config";
import { resend } from "../../resend";
import { bearerAuth } from "hono/bearer-auth";
import { auth } from "../auth";

/**
 * Send a new email with the API.
 * This is the default export, which
 * will later be used in the index.ts at `src/`.
 */
export default function SendEmail() {
  // TODO: add authentication
  app.post(
    "/email/send",
    bearerAuth({
      verifyToken: async (token, c) => {
        return await auth({
          token,
          context: c,
        });
      },
    }),
    async (c) => {
      /**
       * Parsed body from hono. You can get now the provided email fields.
       */
      const body = await c.req.json();

      /**The email subject.
       *
       * [see on google](https://www.google.com/search?q=what+is+an+email+subject&oq=what+is+an+email+subject&sourceid=chrome&ie=UTF-8)
       */
      const subject: string = body.subject as string;

      /**
       * The Email content.
       */
      const content: string = body.content as string;

      /**
       * The sender of the email.
       */
      const sender: string = body.sender as string;

      /**
       * The recipient of the email. Usefull when you use multiple adresses or domains.
       */
      const recipient: string = body.recipient as string;

      /**
       * Parsing the provided fields with zod, to make sure, we can working with the variables.
       */
      const emailSchema = await z
        .object({
          content: z.string(),
          sender: z.string().email(),
          subject: z.string(),
          recipient: z.string().email(),
        })
        .safeParseAsync({
          subject,
          content,
          sender,
          recipient,
        });

      // The provided values are not matching the required types, an error will be send back.
      if (!emailSchema.success) {
        return c.json(
          {
            error: "Typeerror: cannot parse the required fields",
          },
          {
            status: 400,
            statusText: "Required fields are not valid or have a wrong schema.",
          },
        );
      }
      // checking if the sender is in the db
      const adresse = await db.adresse.findUnique({
        where: {
          email: emailSchema.data.sender,
        },
      });

      // adresse is not defined in the database
      if (!adresse) {
        if (config.LOG_ERRORS_INTO_CONSOLE)
          console.error("Sender is not defined in the database.");
        return c.json(
          {
            error: "Cannot find the sender in the database",
          },
          {
            status: 400,
            statusText:
              "There was an error in the db: we can't find the sender in the db.",
          },
        );
      }

      const { error } = await resend.emails.send({
        from: emailSchema.data.sender,
        to: emailSchema.data.recipient,
        subject: subject,
        html: content,
      });

      if (error) {
        if (config.LOG_ERRORS_INTO_CONSOLE)
          console.error(
            "Could not send email to the recipient: \n\n" + error.message,
          );
        return c.json(
          {
            error:
              "Could not deliver email to the recipient: \n\n" + error.message,
          },
          {
            status: 500,
            statusText: "Internal server error",
          },
        );
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
