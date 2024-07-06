import { app } from "..";
import { z } from "zod";
import { db } from "database";
import { resend } from "../../resend";
import { config } from "../../config";

/**
 * Handles the route to receive an email.
 */
export default function ReceiveEmail() {
  /**
   * Receive an email with this post endpoint. This endpoint will be requested, when in the cloudflare worker came an email.
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
    const body = await c.req.parseBody();

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
    const emailSchema = z
      .object({
        content: z.string(),
        sender: z.string().email(),
        subject: z.string(),
        recipient: z.string().email(),
      })
      .safeParse({
        subject,
        content,
        sender,
        recipient,
      });

    // The provided values are not matching the required types, an error will be send back.
    if (!emailSchema.success) {
      console.error(emailSchema.error);
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

    /**
     * Checking if the recipient exists in the database (if the recipient exists)
     */
    const user = await db.user.findUnique({
      where: {
        email: emailSchema.data.recipient,
      },
    });

    // the recipient is not defined, send an email to the sender, that the recipient was not found
    if (!user) {
      /**
       * Sends the error email to the user.
       * The defined template will be used, or the default template, if the template is not defined.
       *
       * TODO: add rate limiting
       */
      const { data, error } = await resend.emails.send({
        from: config.SUPPORT_MAIL,
        to: emailSchema.data.recipient,
        subject: "Email could not be delivered.",
        html:
          c.get("error_html") ||
          "<strong>Sorry, we weren't able to deliver your email. The choosen recipient don't exists.</strong>",
      });
      if (config.LOG_ERRORS_INTO_CONSOLE && !error) {
        console.log(
          `[i] Email could not be delivered. The choosen recipient don't exists.`,
        );
      }
      if (error && config.LOG_ERRORS_INTO_CONSOLE) {
        console.error(
          `[i] Email could not be delivered. The error:\n${error.message}`,
        );
      }
      //TODO: implement the error log into the db

      // return the 404 status code back
      return c.json(
        {
          error: "Recipient was not found",
        },
        {
          status: 404,
          statusText: "User not found",
        },
      );
    }

    /**
     * Uploading the email to the database.
     * The email can now rated by the ai.
     * E.g: add labels or mark as spam, newsletter or ads.
     *
     * TODO: add rate limiting
     * TODO: add ai processing
     */

    const email = await db.email.create({
      data: {
        content: emailSchema.data.content,
        sender: emailSchema.data.sender,
        subject: emailSchema.data.subject,
        recipient: emailSchema.data.recipient,
        userId: "clq35555555555555555555555555555555",
      },
    });

    // the email could not be saved in the db, an error is occured
    if (!email) {
      const { data, error } = await resend.emails.send({
        from: config.SUPPORT_MAIL,
        to: emailSchema.data.recipient,
        subject: "Email could not be delivered.",
        html:
          c.get("error_html") ||
          "<strong>Sorry, we we have an error by saving your email. Please contact us.</strong>",
      });
      // only warn in the console
      if (config.LOG_ERRORS_INTO_CONSOLE && !error) {
        console.error(
          "[i] Email could not be saved in the database. Email was send by: " +
          emailSchema.data.sender +
          " and the recipient is: " +
          emailSchema.data.recipient,
        );
      }
      // warn in the console, that also the delivering of the error email went wrong
      if (error && config.LOG_ERRORS_INTO_CONSOLE) {
        console.error(
          `[i] Email could not be delivered and an error occures when saving the data into the database. The error:\n\n${error.message}`,
        );
      }
      // return the status code
      return c.json(
        {
          error: "Database error: cannot save the email",
        },
        {
          status: 500,
          statusText: "Database error",
        },
      );
    }

    /**
     * All is going correctly, send the 200 status code back
     */
    return c.json(
      {
        error: undefined,
      },
      {
        status: 200,
        statusText: "All is processing correctly.",
      },
    );
  });
}
