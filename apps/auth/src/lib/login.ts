import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    // TODO: add posthog analytics, ratelimiting, proper error handling, user logic, cookie handling, organization handling, etc.
    const dbUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (!dbUser) {
      throw new Error("Invalid email or password");
    }
  });
