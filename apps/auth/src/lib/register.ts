import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const logger = createLogger("auth-register");

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  email: z
    .email("Invalid email address")
    .transform((email) => email.trim().toLowerCase()),
});

type RegisterErrorCode =
  | "EMAIL_TAKEN"
  | "VALIDATION_ERROR"
  | "UNKNOWN_ERROR";

export type RegisterResult =
  | {
      status: "success";
      email: string;
    }
  | {
      status: "error";
      error: {
        code: RegisterErrorCode;
        message: string;
        requestId: string;
      };
    };

const createRequestId = () => crypto.randomUUID();
const createVerificationToken = () => crypto.randomUUID().replaceAll("-", "");

export const handleRegisterForm = createServerFn({ method: "POST" })
  .inputValidator(registerSchema)
  .handler(async (ctx): Promise<RegisterResult> => {
    const requestId = createRequestId();
    const { email, name } = ctx.data;

    logger.info("Register attempt started", {
      email,
      requestId,
    });

    try {
      await db.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            name,
            accounts: {
              create: {
                provider: "EMAIL",
                providerAccountId: email,
              },
            },
          },
        });

        await tx.emailVerification.create({
          data: {
            email,
            userId: user.id,
            token: createVerificationToken(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
      });

      logger.info("Register attempt succeeded", {
        email,
        requestId,
      });

      return {
        status: "success",
        email,
      };
    } catch (error) {
      const knownError =
        error instanceof Error && "code" in error ? String(error.code) : undefined;

      if (knownError === "P2002") {
        logger.warn("Register attempt rejected because email already exists", {
          email,
          requestId,
        });

        return {
          status: "error",
          error: {
            code: "EMAIL_TAKEN",
            message: "This email address is already registered.",
            requestId,
          },
        };
      }

      logger.error(
        "Register attempt failed unexpectedly",
        error instanceof Error ? error : undefined,
        { email, requestId }
      );

      return {
        status: "error",
        error: {
          code: "UNKNOWN_ERROR",
          message: "We could not create your account right now. Please try again later.",
          requestId,
        },
      };
    }
  });
