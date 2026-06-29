import crypto from "node:crypto";
import { db } from "@selfmail/db";
import { RateLimiter } from "@selfmail/web-ratelimit";
import { createServerFn } from "@tanstack/react-start";
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

    // Rate limiting
    const limiter = new RateLimiter("auth-login");

    const idHash = crypto.createHash("sha256").update(randomId).digest("hex");

    // TODO: ratelimit users

    const account = await db.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "EMAIL",
          providerAccountId: normalizedEmail,
        },
      },
    });

    if (!account) {
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

      await db.$transaction([
        db.magicLink.deleteMany({
          where: { email },
        }),
        db.magicLink.create({
          data: {
            browserTokenHash,
            email,
            token: tokenHash,
            expiresAt,
            userId: account.userId,
          },
        }),
      ]);
    } catch (_) {
      throw new Error("Failed to create magic link token.");
    }

    return;
  });
