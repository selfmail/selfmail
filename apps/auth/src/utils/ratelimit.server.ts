import { createLogger } from "@selfmail/logging";
import { Ratelimit } from "@selfmail/redis";
import {
	getRequestHeader,
	getRequestIP,
} from "@tanstack/react-start/server";
import { SessionUtils } from "#/utils/session.server";

const logger = createLogger("auth-ratelimit");

export type AuthAction = "login" | "register";
export type AuthRateLimitState = {
	allowed: boolean;
	resetAt: Date;
};

export abstract class AuthRatelimitUtils {
	private static async getFingerprint(action: AuthAction, email: string) {
		const forwardedIp = getRequestIP({ xForwardedFor: true });
		const realIp = getRequestHeader("x-real-ip");
		const ip = forwardedIp ?? realIp ?? "unknown";
		const normalizedEmail = email.trim().toLowerCase();

		return {
			emailKey: await SessionUtils.hashToken(`${action}:email:${normalizedEmail}`),
			ipKey: await SessionUtils.hashToken(`${action}:ip:${ip}`),
		};
	}

	static async enforce(
		action: AuthAction,
		email: string,
	): Promise<AuthRateLimitState> {
		try {
			const { emailKey, ipKey } = await AuthRatelimitUtils.getFingerprint(
				action,
				email,
			);
			const emailLimiter = new Ratelimit({
				keyPrefix: `auth:${action}:email`,
				limit: 5,
				windowSeconds: 15 * 60,
			});
			const ipLimiter = new Ratelimit({
				keyPrefix: `auth:${action}:ip`,
				limit: 20,
				windowSeconds: 15 * 60,
			});
			const [emailResult, ipResult] = await Promise.all([
				emailLimiter.check(emailKey),
				ipLimiter.check(ipKey),
			]);

			if (emailResult.allowed && ipResult.allowed) {
				return {
					allowed: true,
					resetAt:
						emailResult.resetAt > ipResult.resetAt
							? emailResult.resetAt
							: ipResult.resetAt,
				};
			}

			return {
				allowed: false,
				resetAt:
					emailResult.resetAt < ipResult.resetAt
						? emailResult.resetAt
						: ipResult.resetAt,
			};
		} catch (error) {
			logger.error(
				"Auth rate limit denied because Redis check failed",
				error instanceof Error ? error : undefined,
				{ action },
			);

			return {
				allowed: false,
				resetAt: new Date(Date.now() + 15 * 60 * 1000),
			};
		}
	}
}
