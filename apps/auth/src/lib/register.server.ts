import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { enforceAuthRateLimit } from "#/lib/ratelimit";
import type { RegisterResult } from "#/lib/register";
import {
	createBrowserToken,
	getTempSessionCookie,
	hashToken,
	setTempSessionCookie,
} from "#/lib/session.server";

const logger = createLogger("auth-register");

const createRequestId = () => crypto.randomUUID();
const createVerificationToken = () => crypto.randomUUID().replaceAll("-", "");

export const handleRegister = async ({
	email,
	name,
}: {
	email: string;
	name: string;
}): Promise<RegisterResult> => {
	const requestId = createRequestId();
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
};

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

export const resendRegisterVerification = async ({
	email,
}: {
	email: string;
}): Promise<ResendRegisterVerificationResult> => {
	const requestId = createRequestId();
	const rateLimit = await enforceAuthRateLimit("register", email);

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

		const existingBrowserToken = getTempSessionCookie();
		const browserToken = existingBrowserToken ?? createBrowserToken();

		if (!existingBrowserToken) {
			setTempSessionCookie(browserToken);
		}

		const browserTokenHash = await hashToken(browserToken);
		const token = createVerificationToken();

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
				token,
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
			},
			update: {
				browserTokenHash,
				token,
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
			},
		});

		logger.info("Verification email resent", {
			email,
			requestId,
			verificationUrl: `${process.env.AUTH_APP_URL ?? "http://localhost:3010"}/verify?token=${token}`,
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
};
