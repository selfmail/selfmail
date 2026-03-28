import { createLogger } from "@selfmail/logging";
import { hashToken } from "#/lib/session.server";

const logger = createLogger("auth-ratelimit");

type AuthAction = "login" | "register";

interface AuthRateLimitState {
	allowed: boolean;
	resetAt: Date;
}

const getFingerprint = async (action: AuthAction, email: string) => {
	const [{ getRequestHeader, getRequestIP }, { Ratelimit }] = await Promise.all(
		[import("@tanstack/react-start/server"), import("@selfmail/redis")],
	);
	const forwardedIp = getRequestIP({ xForwardedFor: true });
	const realIp = getRequestHeader("x-real-ip");
	const ip = forwardedIp ?? realIp ?? "unknown";
	const normalizedEmail = email.trim().toLowerCase();

	return {
		Ratelimit,
		emailKey: await hashToken(`${action}:email:${normalizedEmail}`),
		ipKey: await hashToken(`${action}:ip:${ip}`),
	};
};

export const enforceAuthRateLimit = async (
	action: AuthAction,
	email: string,
): Promise<AuthRateLimitState> => {
	try {
		const { Ratelimit, emailKey, ipKey } = await getFingerprint(action, email);
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
		logger.warn("Auth rate limit skipped because Redis check failed", {
			action,
			error:
				error instanceof Error
					? {
							message: error.message,
							name: error.name,
						}
					: "unknown",
		});

		return {
			allowed: true,
			resetAt: new Date(),
		};
	}
};
