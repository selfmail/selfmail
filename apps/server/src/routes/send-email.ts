import { db } from "database";
import { bearerAuth } from "hono/bearer-auth";
import { z } from "zod";
import { app } from "..";
import { config } from "../../config";
import { auth } from "../auth";
import { postal } from "../postal";

/**
 * Send a new email with the API.
 * This is the default export, which
 * will later be used in the index.ts at `src/`.
 */
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
    const body = await c.req.json();


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
        subject: body.subject,
        content: body.content,
        sender: body.sender,
        recipient: body.recipient,
        from: body.from,
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

    // checks done, send the email
    const msg = await postal.sendMessage({
      from: emailSchema.data.from,
      to: emailSchema.data.recipient,
      subject: emailSchema.data.subject,
      html: emailSchema.data.content,
    });



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
