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

const logger = createLogger("auth-magic-link");
const SESSION_COOKIE_NAME = "selfmail-session-token";
const TEMP_SESSION_COOKIE_NAME = "selfmail-temp-session-token";
const PROD_SHARED_DOMAIN = "selfmail.app";
const DEV_SHARED_DOMAIN = "selfmail.local";
const DEV_LOCALHOST_DOMAIN = "selfmail.localhost";

export type VerifyMagicLinkResult =
	| {
			status: "error";
			error: {
				message: string;
				requestId: string;
			};
	  }
	| {
			status: "success";
	  };

export abstract class MagicLinkUtils {
	private static createRequestId() {
		return crypto.randomUUID();
	}

	private static normalizeHost(host: string) {
		return host.split(":")[0]?.trim().toLowerCase() || "";
	}

	private static getCookieDomain(host: string) {
		const hostname = MagicLinkUtils.normalizeHost(host);

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
		const hostname = MagicLinkUtils.normalizeHost(host);

		return {
			domain: MagicLinkUtils.getCookieDomain(host),
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
		deleteCookie(TEMP_SESSION_COOKIE_NAME, MagicLinkUtils.getCookieOptions());
	}

	private static async createSession(userId: string) {
		const rawToken = crypto.randomUUID();
		const sessionToken = await MagicLinkUtils.hashToken(rawToken);
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
			MagicLinkUtils.getCookieOptions(30 * 24 * 60 * 60),
		);
	}

	private static getAppRedirectUrl() {
		const configuredAppUrl = process.env.SELFMAIL_APP_URL?.trim();

		if (configuredAppUrl) {
			return configuredAppUrl;
		}

		const host = getRequestHost({ xForwardedHost: true });
		const hostname = MagicLinkUtils.normalizeHost(host);

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

	static async verify({
		token,
	}: {
		token: string;
	}): Promise<VerifyMagicLinkResult> {
		const requestId = MagicLinkUtils.createRequestId();

		try {
			const tokenHash = await MagicLinkUtils.hashToken(token);
			const magicLink = await db.magicLink.findUnique({
				where: { token: tokenHash },
			});

			if (!magicLink) {
				return {
					status: "error",
					error: {
						message: m["magic_link.errors.invalid"](),
						requestId,
					},
				};
			}

			if (magicLink.expiresAt < new Date()) {
				await db.magicLink.delete({
					where: { id: magicLink.id },
				});
				MagicLinkUtils.clearTempSessionCookie();

				return {
					status: "error",
					error: {
						message: m["magic_link.errors.expired"](),
						requestId,
					},
				};
			}

			const tempSessionToken = MagicLinkUtils.getTempSessionCookie();
			const tempSessionHash = tempSessionToken
				? await MagicLinkUtils.hashToken(tempSessionToken)
				: undefined;

			if (
				!(tempSessionHash && magicLink.browserTokenHash === tempSessionHash)
			) {
				await db.magicLink.delete({
					where: { id: magicLink.id },
				});
				MagicLinkUtils.clearTempSessionCookie();

				throw redirect({
					search: {
						error: m["magic_link.errors.browser_mismatch"](),
					},
					statusCode: 302,
					to: "/login",
				});
			}

			const user = magicLink.userId
				? await db.user.findUnique({
						where: { id: magicLink.userId },
					})
				: null;

			if (!user) {
				await db.magicLink.delete({
					where: { id: magicLink.id },
				});
				MagicLinkUtils.clearTempSessionCookie();

				return {
					status: "error",
					error: {
						message: m["magic_link.errors.account_missing"](),
						requestId,
					},
				};
			}

			await db.$transaction(async (tx) => {
				if (!user?.emailVerified) {
					await tx.user.update({
						data: {
							emailVerified: new Date(),
						},
						where: {
							id: user.id,
						},
					});
				}

				await tx.magicLink.delete({
					where: {
						id: magicLink.id,
					},
				});
			});

			MagicLinkUtils.clearTempSessionCookie();
			await MagicLinkUtils.createSession(user.id);

			throw redirect({
				href: MagicLinkUtils.getAppRedirectUrl(),
				statusCode: 302,
			});
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}

			logger.error(
				"Magic link verification failed unexpectedly",
				error instanceof Error ? error : undefined,
				{ requestId },
			);

			return {
				status: "error",
				error: {
					message: m["magic_link.errors.unknown"](),
					requestId,
				},
			};
		}
	}
}
