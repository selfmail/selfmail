import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  clearTempSessionCookie,
  createSession,
  getAppRedirectUrl,
  getTempSessionCookie,
  hashToken,
} from "#/lib/session";

const schema = z.object({
  token: z.string().min(32).max(64),
});

const logger = createLogger("auth-magic-link");

type VerifyMagicLinkResult =
  | {
      status: "error";
      error: {
        message: string;
        requestId: string;
      };
    }
  | {
      status: "success";
    };

const createRequestId = () => crypto.randomUUID();

export const verifyMagicLinkToken = createServerFn({
  method: "POST",
})
  .inputValidator(schema)
  .handler(async (ctx): Promise<VerifyMagicLinkResult> => {
    const requestId = createRequestId();

    try {
      const tokenHash = await hashToken(ctx.data.token);
      const magicLink = await db.magicLink.findUnique({
        where: { token: tokenHash },
      });

      if (!magicLink) {
        return {
          status: "error",
          error: {
            message: "This magic link is invalid or has already been used.",
            requestId,
          },
        };
      }

      if (magicLink.expiresAt < new Date()) {
        await db.magicLink.delete({
          where: { id: magicLink.id },
        });
        clearTempSessionCookie();

        return {
          status: "error",
          error: {
            message: "This magic link has expired. Please request a new one.",
            requestId,
          },
        };
      }

      const tempSessionToken = getTempSessionCookie();
      const tempSessionHash = tempSessionToken
        ? await hashToken(tempSessionToken)
        : undefined;

      if (!(tempSessionHash && magicLink.browserTokenHash === tempSessionHash)) {
        await db.magicLink.delete({
          where: { id: magicLink.id },
        });
        clearTempSessionCookie();

        throw redirect({
          search: {
            error:
              "We could not verify this browser. Please sign in again and reopen the link in the same browser.",
          },
          statusCode: 302,
          to: "/login",
        });
      }

      let user = await db.user.findUnique({
        where: { email: magicLink.email },
      });

      if (!user && magicLink.userId) {
        user = await db.user.findUnique({
          where: { id: magicLink.userId },
        });
      }

      if (!user) {
        await db.magicLink.delete({
          where: { id: magicLink.id },
        });
        clearTempSessionCookie();

        return {
          status: "error",
          error: {
            message:
              "We could not find the account for this magic link anymore. Please try signing in again.",
            requestId,
          },
        };
      }

      await db.$transaction(async (tx) => {
        if (!user?.emailVerified) {
          await tx.user.update({
            data: {
              emailVerified: new Date(),
            },
            where: {
              id: user.id,
            },
          });
        }

        await tx.magicLink.delete({
          where: {
            id: magicLink.id,
          },
        });
      });

      clearTempSessionCookie();
      await createSession(user.id);

      throw redirect({
        href: getAppRedirectUrl(),
        statusCode: 302,
      });
    } catch (error) {
      if (error instanceof Response) {
        throw error;
      }

      logger.error(
        "Magic link verification failed unexpectedly",
        error instanceof Error ? error : undefined,
        { requestId, token: ctx.data.token }
      );

      return {
        status: "error",
        error: {
          message:
            "We could not finish signing you in right now. Please try again or contact support if this keeps happening.",
          requestId,
        },
      };
    }
  });
