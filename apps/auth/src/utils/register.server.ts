import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import type { RegisterResult } from "#/lib/register";
import { AuthRatelimitUtils } from "#/utils/ratelimit.server";
import { SessionUtils } from "#/utils/session.server";

const logger = createLogger("auth-register");

export type ResendRegisterVerificationResult =
	| {
			status: "error";
			error: {
				code:
					| "RATE_LIMITED"
					| "ACCOUNT_NOT_FOUND"
					| "ALREADY_VERIFIED"
					| "UNKNOWN_ERROR";
				message: string;
				requestId: string;
			};
	  }
	| {
			status: "success";
	  };

export abstract class RegisterUtils {
	private static createRequestId() {
		return crypto.randomUUID();
	}

	private static createVerificationToken() {
		return crypto.randomUUID().replaceAll("-", "");
	}

	static async handleRegister({
		email,
		name,
	}: {
		email: string;
		name: string;
	}): Promise<RegisterResult> {
		const requestId = RegisterUtils.createRequestId();
		const rateLimit = await AuthRatelimitUtils.enforce("register", email);

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
			const browserToken = SessionUtils.createBrowserToken();
			const browserTokenHash = await SessionUtils.hashToken(browserToken);
			const rawToken = RegisterUtils.createVerificationToken();
			const tokenHash = await SessionUtils.hashToken(rawToken);

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
						token: tokenHash,
						expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
					},
				});
			});

			SessionUtils.setTempSessionCookie(browserToken);

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
	}

	static async resendVerification({
		email,
	}: {
		email: string;
	}): Promise<ResendRegisterVerificationResult> {
		const requestId = RegisterUtils.createRequestId();
		const rateLimit = await AuthRatelimitUtils.enforce("register", email);

		if (!rateLimit.allowed) {
			return {
				status: "error",
				error: {
					code: "RATE_LIMITED",
					message: `Too many resend attempts. Please wait until ${rateLimit.resetAt.toISOString()} and try again.`,
					requestId,
				},
			};
		}

		try {
			const user = await db.user.findUnique({
				where: {
					email,
				},
			});

			if (!user) {
				return {
					status: "error",
					error: {
						code: "ACCOUNT_NOT_FOUND",
						message: "No account exists for this email address.",
						requestId,
					},
				};
			}

			if (user.emailVerified) {
				return {
					status: "error",
					error: {
						code: "ALREADY_VERIFIED",
						message: "This email address is already verified.",
						requestId,
					},
				};
			}

			const existingBrowserToken = SessionUtils.getTempSessionCookie();
			const browserToken =
				existingBrowserToken ?? SessionUtils.createBrowserToken();

			if (!existingBrowserToken) {
				SessionUtils.setTempSessionCookie(browserToken);
			}

			const browserTokenHash = await SessionUtils.hashToken(browserToken);
			const rawToken = RegisterUtils.createVerificationToken();
			const tokenHash = await SessionUtils.hashToken(rawToken);

			await db.emailVerification.upsert({
				where: {
					email_userId: {
						email,
						userId: user.id,
					},
				},
				create: {
					email,
					userId: user.id,
					browserTokenHash,
					token: tokenHash,
					expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
				},
				update: {
					browserTokenHash,
					token: tokenHash,
					expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
				},
			});

			logger.info("Verification email resent", {
				email,
				requestId,
			});

			return {
				status: "success",
			};
		} catch (error) {
			logger.error(
				"Verification email resend failed unexpectedly",
				error instanceof Error ? error : undefined,
				{ email, requestId },
			);

			return {
				status: "error",
				error: {
					code: "UNKNOWN_ERROR",
					message:
						"We could not resend your verification email right now. Please try again later.",
					requestId,
				},
			};
		}
	}
}
