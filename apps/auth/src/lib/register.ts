import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { enforceAuthRateLimit } from "#/lib/ratelimit";
import {
	createBrowserToken,
	hashToken,
	setTempSessionCookie,
} from "#/lib/session";

const logger = createLogger("auth-register");

const registerSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Name is required")
		.max(120, "Name is too long"),
	email: z
		.email("Invalid email address")
		.transform((email) => email.trim().toLowerCase()),
});

type RegisterErrorCode =
	| "EMAIL_TAKEN"
	| "RATE_LIMITED"
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
		const rateLimit = await enforceAuthRateLimit("register", email);

		if (!rateLimit.allowed) {
			return {
				status: "error",
				error: {
					code: "RATE_LIMITED",
					message: `Too many registration attempts. Please wait until ${rateLimit.resetAt.toISOString()} and try again.`,
					requestId,
				},
			};
		}

		logger.info("Register attempt started", {
			email,
			requestId,
		});

		try {
			const browserToken = createBrowserToken();
			const browserTokenHash = await hashToken(browserToken);
			const token = createVerificationToken();

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
						browserTokenHash,
						token,
						expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
					},
				});
			});

			setTempSessionCookie(browserToken);

			logger.info("Register attempt succeeded", {
				email,
				requestId,
				verificationUrl: `${process.env.AUTH_APP_URL ?? "http://localhost:3010"}/verify?token=${token}`,
			});

			return {
				status: "success",
				email,
			};
		} catch (error) {
			const knownError =
				error instanceof Error && "code" in error
					? String(error.code)
					: undefined;

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
				{ email, requestId },
			);

			return {
				status: "error",
				error: {
					code: "UNKNOWN_ERROR",
					message:
						"We could not create your account right now. Please try again later.",
					requestId,
				},
			};
		}
	});
