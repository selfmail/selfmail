import { serve } from "@hono/node-server";
import { Hono } from "hono";
import Handler from "./handler";
import CheckConfig from "./check-config";
import fs from "node:fs";

/**
 * Variables which will be defined below and can be used everywhere in the app.
 */
type Variables = {
  /**
   * The html string for the error page.
   * This will be send to the sender if an error occures as an email.
   */
  error_html: string;
  /**
   * The htmls string when the recipient is not found.
   */
  email_recipient_not_found: string;
  /**
   * The html string when the rate limit is exceeded.
   */
  rate_limited: string;
};

export const app = new Hono<{ Variables: Variables }>();

/**
 * The hono middleware
 * The html string variables are here defined with the c.set("variable_name", "variable_content") function. They can be used in the routes with c.get("variable_name")
 *
 * @see https://hono.dev/docs/api/context#set-get
 */
app.use(async (c, next) => {
  /**
   * Set the error_html variable to the html string of the error page.
   * This will be send to the sender if an error occures as an email.
   */
  c.set(
    "error_html",
    await fs.promises.readFile("./templates/error.html", "utf-8"),
  );
  c.set(
    "email_recipient_not_found",
    await fs.promises.readFile(
      "./templates/email-recipient-not-found.html",
      "utf-8",
    ),
  );
  c.set(
    "rate_limited",
    await fs.promises.readFile("./templates/rate-limited.html", "utf-8"),
  );
  // Go to the next check or open the requested route
  await next();
});

app.get("/", (c) => {
  return c.html("hello world");
});

Handler();
CheckConfig();

// run the server
const port = 5000;
console.log(`[i] Server is running on port ${port}.`);

serve({
  fetch: app.fetch,
  port,
});
