import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { RateLimiter } from "@selfmail/web-ratelimit";
import {
	getCookie,
	getRequestHeader,
	getRequestHost,
	getRequestIP,
	getRequestProtocol,
	setCookie,
} from "@tanstack/react-start/server";

const logger = createLogger("auth-register");
const emailLimiter = new RateLimiter("auth-register-email");
const ipLimiter = new RateLimiter("auth-register-ip");
const TEMP_SESSION_COOKIE_NAME = "selfmail-temp-session-token";
const PROD_SHARED_DOMAIN = "selfmail.app";
const DEV_SHARED_DOMAIN = "selfmail.local";
const DEV_LOCALHOST_DOMAIN = "selfmail.localhost";
const RATE_LIMIT_WINDOW_SECONDS = 15 * 60;

export type RegisterResult =
	| {
			status: "error";
			error: {
				code: "EMAIL_TAKEN" | "RATE_LIMITED" | "UNKNOWN_ERROR";
				message: string;
				requestId: string;
			};
	  }
	| {
			status: "success";
			email: string;
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

export abstract class RegisterUtils {
	private static createRequestId() {
		return crypto.randomUUID();
	}

	private static createBrowserToken() {
		return crypto.randomUUID();
	}

	private static createVerificationToken() {
		return crypto.randomUUID().replaceAll("-", "");
	}

	private static normalizeHost(host: string) {
		return host.split(":")[0]?.trim().toLowerCase() || "";
	}

	private static getCookieDomain(host: string) {
		const hostname = RegisterUtils.normalizeHost(host);

		if (
			hostname === PROD_SHARED_DOMAIN ||
			hostname.endsWith(`.${PROD_SHARED_DOMAIN}`)
		) {
			return `.${PROD_SHARED_DOMAIN}`;
		}

		if (
			hostname === DEV_SHARED_DOMAIN ||
			hostname.endsWith(`.${DEV_SHARED_DOMAIN}`)
		) {
			return `.${DEV_SHARED_DOMAIN}`;
		}

		if (
			hostname === DEV_LOCALHOST_DOMAIN ||
			hostname.endsWith(`.${DEV_LOCALHOST_DOMAIN}`)
		) {
			return `.${DEV_LOCALHOST_DOMAIN}`;
		}

		return undefined;
	}

	private static getCookieOptions(maxAge?: number) {
		const host = getRequestHost({ xForwardedHost: true });
		const protocol = getRequestProtocol({ xForwardedProto: true });
		const hostname = RegisterUtils.normalizeHost(host);

		return {
			domain: RegisterUtils.getCookieDomain(host),
			httpOnly: true,
			maxAge,
			path: "/",
			sameSite: "lax" as const,
			secure:
				protocol === "https" ||
				hostname === PROD_SHARED_DOMAIN ||
				hostname.endsWith(`.${PROD_SHARED_DOMAIN}`),
		};
	}

	private static async hashToken(value: string) {
		const digest = await crypto.subtle.digest(
			"SHA-256",
			new TextEncoder().encode(value),
		);

		return Array.from(new Uint8Array(digest), (part) =>
			part.toString(16).padStart(2, "0"),
		).join("");
	}

	private static getTempSessionCookie() {
		return getCookie(TEMP_SESSION_COOKIE_NAME);
	}

	private static setTempSessionCookie(token: string) {
		setCookie(
			TEMP_SESSION_COOKIE_NAME,
			token,
			RegisterUtils.getCookieOptions(24 * 60 * 60),
		);
	}

	private static async enforceRateLimit(email: string) {
		try {
			const forwardedIp = getRequestIP({ xForwardedFor: true });
			const realIp = getRequestHeader("x-real-ip");
			const ip = forwardedIp ?? realIp ?? "unknown";
			const normalizedEmail = email.trim().toLowerCase();
			const emailKey = await RegisterUtils.hashToken(
				`register:email:${normalizedEmail}`,
			);
			const ipKey = await RegisterUtils.hashToken(`register:ip:${ip}`);
			const [emailResult, ipResult] = await Promise.all([
				emailLimiter.limit(emailKey, {
					limit: 5,
					windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
				}),
				ipLimiter.limit(ipKey, {
					limit: 20,
					windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
				}),
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
				"Register rate limit denied because Redis check failed",
				error instanceof Error ? error : undefined,
			);

			return {
				allowed: false,
				resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW_SECONDS * 1000),
			};
		}
	}

	static async handleRegister({
		email,
		name,
	}: {
		email: string;
		name: string;
	}): Promise<RegisterResult> {
		const requestId = RegisterUtils.createRequestId();
		const rateLimit = await RegisterUtils.enforceRateLimit(email);

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
			const browserToken = RegisterUtils.createBrowserToken();
			const browserTokenHash = await RegisterUtils.hashToken(browserToken);
			const rawToken = RegisterUtils.createVerificationToken();
			const tokenHash = await RegisterUtils.hashToken(rawToken);

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

			RegisterUtils.setTempSessionCookie(browserToken);

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
		const rateLimit = await RegisterUtils.enforceRateLimit(email);

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
			const user = await db.user.findFirst({
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

			const existingBrowserToken = RegisterUtils.getTempSessionCookie();
			const browserToken =
				existingBrowserToken ?? RegisterUtils.createBrowserToken();

			if (!existingBrowserToken) {
				RegisterUtils.setTempSessionCookie(browserToken);
			}

			const browserTokenHash = await RegisterUtils.hashToken(browserToken);
			const rawToken = RegisterUtils.createVerificationToken();
			const tokenHash = await RegisterUtils.hashToken(rawToken);

			await db.$transaction(async (tx) => {
				await tx.emailVerification.deleteMany({
					where: {
						email,
						userId: user.id,
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
