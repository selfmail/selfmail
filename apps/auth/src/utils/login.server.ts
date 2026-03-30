import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import type { LoginResult } from "#/lib/login";
import { AuthRatelimitUtils } from "#/utils/ratelimit.server";
import { SessionUtils } from "#/utils/session.server";

const logger = createLogger("auth-login");

export abstract class LoginUtils {
	private static createRequestId() {
		return crypto.randomUUID();
	}

	private static createMagicLinkToken() {
		return crypto.randomUUID().replaceAll("-", "");
	}

	static async handleLogin({
		email,
	}: {
		email: string;
	}): Promise<LoginResult> {
		const requestId = LoginUtils.createRequestId();
		const rateLimit = await AuthRatelimitUtils.enforce("login", email);

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

			const token = LoginUtils.createMagicLinkToken();
			const tempSessionToken = SessionUtils.createBrowserToken();
			const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
			const tokenHash = await SessionUtils.hashToken(token);
			const browserTokenHash = await SessionUtils.hashToken(tempSessionToken);

			console.log(
				"Magic link url:",
				`http://auth.selfmail.localhost:1355/magic?token=${token}`,
			);

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

			SessionUtils.setTempSessionCookie(tempSessionToken);

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
	}
}
