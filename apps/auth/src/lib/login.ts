import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const logger = createLogger("auth-login");

const loginSchema = z.object({
  email: z
    .email("Invalid email address")
    .transform((email) => email.trim().toLowerCase()),
});

type LoginErrorCode = "ACCOUNT_NOT_FOUND" | "UNKNOWN_ERROR";

export type LoginResult =
  | {
      status: "success";
      email: string;
      magicLinkUrl: string;
      expiresAt: string;
    }
  | {
      status: "error";
      error: {
        code: LoginErrorCode;
        message: string;
        requestId: string;
      };
    };

const createRequestId = () => crypto.randomUUID();
const createMagicLinkToken = () => crypto.randomUUID().replaceAll("-", "");

export const handleLoginForm = createServerFn({
  method: "POST",
})
  .inputValidator(loginSchema)
  .handler(async (ctx): Promise<LoginResult> => {
    const requestId = createRequestId();
    const { email } = ctx.data;

    logger.info("Magic link login started", {
      email,
      requestId,
    });

    try {
      const user = await db.user.findUnique({
        where: { email },
      });

      if (!user) {
        logger.warn(
          "Magic link login rejected because account does not exist",
          {
            email,
            requestId,
          }
        );

        return {
          status: "error",
          error: {
            code: "ACCOUNT_NOT_FOUND",
            message: "We could not find an account for this email address.",
            requestId,
          },
        };
      }

      const token = createMagicLinkToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const magicLinkUrl = `${process.env.AUTH_APP_URL ?? "http://localhost:3010"}/magic-link?token=${token}`;

      await db.$transaction([
        db.magicLink.deleteMany({
          where: { email },
        }),
        db.magicLink.create({
          data: {
            email,
            token,
            expiresAt,
            userId: user.id,
          },
        }),
      ]);

      logger.info("Dummy magic link created", {
        email,
        requestId,
        magicLinkUrl,
        expiresAt: expiresAt.toISOString(),
      });

      console.info("Dummy magic link delivery", {
        email,
        magicLinkUrl,
        expiresAt: expiresAt.toISOString(),
      });

      return {
        status: "success",
      };
    } catch (error) {
      logger.error(
        "Magic link login failed unexpectedly",
        error instanceof Error ? error : undefined,
        { email, requestId }
      );

      return {
        status: "error",
        error: {
          code: "UNKNOWN_ERROR",
          message:
            "We could not create a magic link right now. Please try again later.",
          requestId,
        },
      };
    }
  });
