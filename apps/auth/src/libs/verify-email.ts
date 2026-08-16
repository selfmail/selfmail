import crypto from "node:crypto";
import { db } from "@selfmail/db";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
	deleteCookie,
	getCookie,
	getRequestHost,
	getRequestProtocol,
	setCookie,
} from "@tanstack/react-start/server";
import { z } from "zod";
import { m } from "#/paraglide/messages";
import { getSafeInternalRedirectUrl } from "#/utils/redirect.server";

const SESSION_COOKIE_NAME = "selfmail-session-token";
const TEMP_SESSION_COOKIE_NAME = "selfmail-temp-session-token";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
const PROD_DOMAIN = "selfmail.app";
const DEV_DOMAIN = "selfmail.localhost";
const LEGACY_DEV_DOMAIN = "selfmail.local";
const SHARED_DOMAINS = [PROD_DOMAIN, DEV_DOMAIN, LEGACY_DEV_DOMAIN];

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

const schema = z.object({
	redirect: z.string().optional(),
	token: z.string().min(1),
});

const hashToken = (token: string) =>
	crypto.createHash("sha256").update(token).digest("hex");

const getRequest = () => {
	const host = getRequestHost({ xForwardedHost: true });
	const protocol = getRequestProtocol({ xForwardedProto: true });
	const hostname = host.split(":")[0]?.trim().toLowerCase() ?? "";

	return { host, hostname, protocol };
};

const getCookieOptions = (maxAge?: number) => {
	const { hostname, protocol } = getRequest();
	const sharedDomain = SHARED_DOMAINS.find(
		(domain) => hostname === domain || hostname.endsWith(`.${domain}`),
	);

	return {
		domain: sharedDomain ? `.${sharedDomain}` : undefined,
		httpOnly: true,
		maxAge,
		path: "/",
		sameSite: "lax" as const,
		secure:
			protocol === "https" ||
			hostname === PROD_DOMAIN ||
			hostname.endsWith(`.${PROD_DOMAIN}`),
	};
};

const getAppRedirectUrl = () => {
	const configuredAppUrl = process.env.SELFMAIL_APP_URL?.trim();

	if (configuredAppUrl) {
		return configuredAppUrl;
	}

	const { host, hostname, protocol } = getRequest();

	if (hostname === DEV_DOMAIN || hostname.endsWith(`.${DEV_DOMAIN}`)) {
		return `https://dashboard.${DEV_DOMAIN}`;
	}

	if (
		hostname === LEGACY_DEV_DOMAIN ||
		hostname.endsWith(`.${LEGACY_DEV_DOMAIN}`)
	) {
		return `${protocol}://${LEGACY_DEV_DOMAIN}`;
	}

	if (hostname === PROD_DOMAIN || hostname.endsWith(`.${PROD_DOMAIN}`)) {
		return `https://dashboard.${PROD_DOMAIN}`;
	}

	return `${protocol}://${host}`;
};

const errorResult = (message: string, requestId: string): VerifyResult => ({
	status: "error",
	error: { message, requestId },
});

export const verifyEmailTokenFn = createServerFn({
	method: "POST",
})
	.validator(schema)
	.handler(async ({ data: { redirect: redirectPath, token } }) => {
		const requestId = crypto.randomUUID();
		const tokenHash = hashToken(token);
		const tokenHashPrefix = tokenHash.slice(0, 12);

		console.log("[verify-email] Verification started", {
			requestId,
			tokenHashPrefix,
		});

		try {
			const emailVerification = await db.emailVerification.findUnique({
				select: {
					browserTokenHash: true,
					expiresAt: true,
					id: true,
					user: {
						select: {
							emailVerified: true,
						},
					},
					userId: true,
				},
				where: { token: tokenHash },
			});

			if (!emailVerification) {
				console.log("[verify-email] Token not found", {
					requestId,
					tokenHashPrefix,
				});
				return errorResult(m["verify.errors.invalid"](), requestId);
			}

			if (emailVerification.expiresAt < new Date()) {
				await db.emailVerification.deleteMany({
					where: { id: emailVerification.id },
				});
				deleteCookie(TEMP_SESSION_COOKIE_NAME, getCookieOptions());
				console.log("[verify-email] Token expired", { requestId });
				return errorResult(m["verify.errors.expired"](), requestId);
			}

			const tempSessionToken = getCookie(TEMP_SESSION_COOKIE_NAME);
			const sameBrowser =
				!!tempSessionToken &&
				!!emailVerification.browserTokenHash &&
				hashToken(tempSessionToken) === emailVerification.browserTokenHash;
			const rawSessionToken = sameBrowser
				? crypto.randomBytes(32).toString("base64url")
				: undefined;

			console.log("[verify-email] Browser check completed", {
				requestId,
				sameBrowser,
			});

			const verified = await db.$transaction(async (tx) => {
				const deleted = await tx.emailVerification.deleteMany({
					where: { id: emailVerification.id },
				});

				if (deleted.count === 0) {
					return false;
				}

				if (!emailVerification.user.emailVerified) {
					await tx.user.update({
						data: { emailVerified: new Date() },
						where: { id: emailVerification.userId },
					});
				}

				if (rawSessionToken) {
					await tx.session.create({
						data: {
							expires: new Date(Date.now() + SESSION_MAX_AGE * 1000),
							sessionToken: hashToken(rawSessionToken),
							userId: emailVerification.userId,
						},
					});
				}

				return true;
			});

			if (!verified) {
				console.log("[verify-email] Token was already consumed", { requestId });
				return errorResult(m["verify.errors.invalid"](), requestId);
			}

			deleteCookie(TEMP_SESSION_COOKIE_NAME, getCookieOptions());

			if (!rawSessionToken) {
				console.log("[verify-email] Email verified; login required", {
					requestId,
				});
				return {
					status: "login_required",
					message: m["verify.success.description"](),
				};
			}

			setCookie(
				SESSION_COOKIE_NAME,
				rawSessionToken,
				getCookieOptions(SESSION_MAX_AGE),
			);

			const href = getSafeInternalRedirectUrl(
				redirectPath,
				getAppRedirectUrl(),
			);
			console.log("[verify-email] Email verified; redirecting", {
				href,
				requestId,
			});
			throw redirect({ href, statusCode: 302 });
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}

			console.log("[verify-email] Verification failed", {
				error: error instanceof Error ? error.message : String(error),
				requestId,
				tokenHashPrefix,
			});
			return errorResult(m["verify.errors.unknown"](), requestId);
		}
	});
