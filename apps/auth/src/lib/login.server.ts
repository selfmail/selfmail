import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import type { LoginResult } from "#/lib/login";
import { enforceAuthRateLimit } from "#/lib/ratelimit";
import {
	createBrowserToken,
	hashToken,
	setTempSessionCookie,
} from "#/lib/session.server";

const logger = createLogger("auth-login");

const createRequestId = () => crypto.randomUUID();
const createMagicLinkToken = () => crypto.randomUUID().replaceAll("-", "");

export const handleLogin = async ({
	email,
}: {
	email: string;
}): Promise<LoginResult> => {
	const requestId = createRequestId();
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
			logger.warn("Magic link login rejected because account does not exist", {
				email,
				requestId,
			});

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

		logger.info("Magic link created", {
			email,
			requestId,
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
};
