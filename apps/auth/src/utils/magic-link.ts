import crypto from "node:crypto";
import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import z from "zod";

const TEMP_SESSION_COOKIE_NAME = "selfmail-temp-session-token";

export const verifyMagicLinkToken = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string().min(32).max(64),
      redirect: z.string().optional(),
    })
  )
  .handler(async ({ data: { token } }) => {
    const magicLinkSession = await db.magicLink.findUnique({
      where: { token: crypto.createHash("sha256").update(token).digest("hex") },
    });

    const userId = magicLinkSession?.userId;

    console.log("[verify-magic-link] Magic link session retrieved", {
      requestId: crypto.randomUUID(),
      hasMagicLinkSession: !!magicLinkSession,
    });

    if (!(magicLinkSession && userId)) {
      return {
        status: "error" as const,
        error: {
          message: "Invalid or expired magic link token.",
          requestId: crypto.randomUUID(),
        },
      };
    }

    if (magicLinkSession.expiresAt < new Date()) {
      return {
        status: "error" as const,
        error: {
          message: "Magic link token has expired.",
          requestId: crypto.randomUUID(),
        },
      };
    }

    // Check whether browser is the same
    const tempSessionToken = getCookie(TEMP_SESSION_COOKIE_NAME);

    const tempSessionTokenHash = tempSessionToken
      ? crypto.createHash("sha256").update(tempSessionToken).digest("hex")
      : null;

    const sameBrowser =
      !!tempSessionTokenHash &&
      tempSessionTokenHash === magicLinkSession.browserTokenHash;

    if (!sameBrowser) {
      return {
        status: "error" as const,
        error: {
          message: "Magic link token was not used from the same browser.",
          requestId: crypto.randomUUID(),
        },
      };
    }

    console.log("[verify-magic-link] Same browser verified", {
      requestId: crypto.randomUUID(),
      sameBrowser,
    });

    // remove old magic link sessions
    try {
      const token = crypto.randomBytes(32).toString("base64url");

      const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(token)
      );

      const tokenHash = Buffer.from(hashBuffer).toString("hex");

      await db.$transaction([
        db.magicLink.deleteMany({
          where: { email: magicLinkSession.email },
        }),
        db.session.create({
          data: {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            sessionToken: tokenHash,
            userId,
          },
        }),
      ]);
      setCookie("selfmail-session-token", token, {
        domain: ".selfmail.localhost",
        path: "/",
        httpOnly: true,
        sameSite: "lax" as const,
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    } catch (_) {
      console.error("[verify-magic-link] Failed to create session", {
        requestId: crypto.randomUUID(),
      });
      return {
        status: "error" as const,
        error: {
          message: "Failed to create session.",
          requestId: crypto.randomUUID(),
        },
      };
    }
    console.log("[verify-magic-link] Session created and cookie set", {
      requestId: crypto.randomUUID(),
    });
  });
