import crypto from "node:crypto";
import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import z from "zod";

export const handleLoginForm = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      email: z.email(),
    })
  )
  .handler(async ({ data: { email } }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const account = await db.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "EMAIL",
          providerAccountId: normalizedEmail,
        },
      },
    });

    if (!account) {
      if (process.env.NODE_ENV === "development") {
        console.log("No account found for email:", normalizedEmail);
      }
      return;
    }

    // Create magic token
    try {
      const randomToken = crypto.randomBytes(32).toString("base64url");
      const randomBrowserToken = crypto.randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
      const tokenHash = crypto
        .createHash("sha256")
        .update(randomToken)
        .digest("hex");
      const browserTokenHash = crypto
        .createHash("sha256")
        .update(randomBrowserToken)
        .digest("hex");

      if (process.env.NODE_ENV === "development") {
        console.log(
          `Go to https://auth.selfmail.localhost/magic/?token=${randomToken} to verify the magic link.`
        );
      }

      await db.$transaction([
        db.magicLink.deleteMany({
          where: { email: normalizedEmail },
        }),
        db.magicLink.create({
          data: {
            browserTokenHash,
            email: normalizedEmail,
            token: tokenHash,
            expiresAt,
            userId: account.userId,
          },
        }),
      ]);

      setCookie("selfmail-temp-session-token", randomBrowserToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hour
      });
    } catch (_) {
      throw new Error("Failed to create magic link token.");
    }

    return;
  });
