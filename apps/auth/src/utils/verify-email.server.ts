import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { redirect } from "@tanstack/react-router";
import {
	deleteCookie,
	getCookie,
	getRequestHost,
	getRequestProtocol,
	setCookie,
} from "@tanstack/react-start/server";
import { m } from "#/paraglide/messages";

const logger = createLogger("auth-verify-email");
const SESSION_COOKIE_NAME = "selfmail-session-token";
const TEMP_SESSION_COOKIE_NAME = "selfmail-temp-session-token";
const PROD_SHARED_DOMAIN = "selfmail.app";
const DEV_SHARED_DOMAIN = "selfmail.local";
const DEV_LOCALHOST_DOMAIN = "selfmail.localhost";

export type VerifyResult =
	| {
			status: "error";
			error: {
				message: string;
				requestId: string;
			};
	  }
	| {
			status: "login_required";
			message: string;
	  }
	| {
			status: "success";
	  };

export abstract class VerifyEmailUtils {
	private static createRequestId() {
		return crypto.randomUUID();
	}

	private static normalizeHost(host: string) {
		return host.split(":")[0]?.trim().toLowerCase() || "";
	}

	private static getCookieDomain(host: string) {
		const hostname = VerifyEmailUtils.normalizeHost(host);

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
		const hostname = VerifyEmailUtils.normalizeHost(host);

		return {
			domain: VerifyEmailUtils.getCookieDomain(host),
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

	private static clearTempSessionCookie() {
		deleteCookie(TEMP_SESSION_COOKIE_NAME, VerifyEmailUtils.getCookieOptions());
	}

	private static async createSession(userId: string) {
		const rawToken = crypto.randomUUID();
		const sessionToken = await VerifyEmailUtils.hashToken(rawToken);
		const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

		await db.session.create({
			data: {
				expires,
				sessionToken,
				userId,
			},
		});

		setCookie(
			SESSION_COOKIE_NAME,
			rawToken,
			VerifyEmailUtils.getCookieOptions(30 * 24 * 60 * 60),
		);
	}

	private static getAppRedirectUrl() {
		const configuredAppUrl = process.env.SELFMAIL_APP_URL?.trim();

		if (configuredAppUrl) {
			return configuredAppUrl;
		}

		const host = getRequestHost({ xForwardedHost: true });
		const hostname = VerifyEmailUtils.normalizeHost(host);

		if (
			hostname === DEV_LOCALHOST_DOMAIN ||
			hostname.endsWith(`.${DEV_LOCALHOST_DOMAIN}`)
		) {
			return `http://${DEV_LOCALHOST_DOMAIN}`;
		}

		if (
			hostname === DEV_SHARED_DOMAIN ||
			hostname.endsWith(`.${DEV_SHARED_DOMAIN}`)
		) {
			return `http://${DEV_SHARED_DOMAIN}`;
		}

		if (
			hostname === PROD_SHARED_DOMAIN ||
			hostname.endsWith(`.${PROD_SHARED_DOMAIN}`)
		) {
			return `https://${PROD_SHARED_DOMAIN}`;
		}

		return `${getRequestProtocol({ xForwardedProto: true })}://${host}`;
	}

	static async verifyToken({
		token,
	}: {
		token: string;
	}): Promise<VerifyResult> {
		const requestId = VerifyEmailUtils.createRequestId();

		try {
			const tokenHash = await VerifyEmailUtils.hashToken(token);
			const emailVerification = await db.emailVerification.findUnique({
				include: {
					user: true,
				},
				where: {
					token: tokenHash,
				},
			});

			if (!emailVerification) {
				return {
					status: "error",
					error: {
						message: m["verify.errors.invalid"](),
						requestId,
					},
				};
			}

			if (emailVerification.expiresAt < new Date()) {
				await db.emailVerification.delete({
					where: {
						id: emailVerification.id,
					},
				});
				VerifyEmailUtils.clearTempSessionCookie();

				return {
					status: "error",
					error: {
						message: m["verify.errors.expired"](),
						requestId,
					},
				};
			}

			const tempSessionToken = VerifyEmailUtils.getTempSessionCookie();
			const tempSessionHash = tempSessionToken
				? await VerifyEmailUtils.hashToken(tempSessionToken)
				: undefined;
			const sameBrowser =
				!!tempSessionHash &&
				!!emailVerification.browserTokenHash &&
				tempSessionHash === emailVerification.browserTokenHash;

			await db.$transaction(async (tx) => {
				if (!emailVerification.user.emailVerified) {
					await tx.user.update({
						data: {
							emailVerified: new Date(),
						},
						where: {
							id: emailVerification.userId,
						},
					});
				}

				await tx.emailVerification.delete({
					where: {
						id: emailVerification.id,
					},
				});
			});

			VerifyEmailUtils.clearTempSessionCookie();

			if (!sameBrowser) {
				return {
					status: "login_required",
					message: m["verify.success.description"](),
				};
			}

			await VerifyEmailUtils.createSession(emailVerification.userId);

			throw redirect({
				href: VerifyEmailUtils.getAppRedirectUrl(),
				statusCode: 302,
			});
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}

			logger.error(
				"Email verification failed unexpectedly",
				error instanceof Error ? error : undefined,
				{ requestId },
			);

			return {
				status: "error",
				error: {
					message: m["verify.errors.unknown"](),
					requestId,
				},
			};
		}
	}
}
