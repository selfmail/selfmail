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

const logger = createLogger("auth-login");

const loginSchema = z.object({
	email: z
		.email("Invalid email address")
		.transform((email) => email.trim().toLowerCase()),
});

type LoginErrorCode = "ACCOUNT_NOT_FOUND" | "RATE_LIMITED" | "UNKNOWN_ERROR";

export type LoginResult =
	| {
			status: "success";
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
		const rateLimit = await enforceAuthRateLimit("login", email);

		if (!rateLimit.allowed) {
			return {
				status: "error",
				error: {
					code: "RATE_LIMITED",
					message: `Too many login attempts. Please wait until ${rateLimit.resetAt.toISOString()} and try again.`,
					requestId,
				},
			};
		}

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
					},
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
			const tempSessionToken = createBrowserToken();
			const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
			const magicLinkUrl = `${process.env.AUTH_APP_URL ?? "http://localhost:3010"}/magic?token=${token}`;
			const tokenHash = await hashToken(token);
			const browserTokenHash = await hashToken(tempSessionToken);

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
						userId: user.id,
					},
				}),
			]);

			setTempSessionCookie(tempSessionToken);

			// TODO: replace with real sending functionality
			logger.info("Dummy magic link created", {
				email,
				requestId,
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
				{ email, requestId },
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
