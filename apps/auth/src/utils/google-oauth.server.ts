import crypto from "node:crypto";
import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { generateCodeVerifier, generateState, Google } from "arctic";
import { z } from "zod";

const logger = createLogger("auth-google");
const STATE_COOKIE_NAME = "selfmail-google-oauth-state";
const CODE_VERIFIER_COOKIE_NAME = "selfmail-google-oauth-code-verifier";
const REDIRECT_COOKIE_NAME = "selfmail-google-oauth-redirect";
const FLOW_COOKIE_NAME = "selfmail-google-oauth-flow";
const SESSION_COOKIE_NAME = "selfmail-session-token";
const OAUTH_COOKIE_MAX_AGE = 10 * 60;
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
const PROD_DOMAIN = "selfmail.app";
const DEV_DOMAIN = "selfmail.localhost";
const LEGACY_DEV_DOMAIN = "selfmail.local";
const SHARED_DOMAINS = [PROD_DOMAIN, DEV_DOMAIN, LEGACY_DEV_DOMAIN];

const googleUserSchema = z.object({
	email: z.email().transform((email) => email.trim().toLowerCase()),
	email_verified: z.literal(true),
	name: z.string().trim().min(1).max(120).optional(),
	picture: z.url().optional(),
	sub: z.string().min(1),
});

type AuthFlow = "login" | "register";

const normalizeRedirect = (value: string | null | undefined) =>
	value?.startsWith("/") && !value.startsWith("//") && value.length <= 2048
		? value
		: undefined;

const getRequestDetails = (request: Request) => {
	const requestUrl = new URL(request.url);
	const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0];
	const forwardedProtocol = request.headers
		.get("x-forwarded-proto")
		?.split(",")[0]
		?.trim()
		.toLowerCase();
	const host = forwardedHost?.trim() || requestUrl.host;
	const protocol =
		forwardedProtocol === "http" || forwardedProtocol === "https"
			? forwardedProtocol
			: requestUrl.protocol.slice(0, -1);
	const origin = new URL(`${protocol}://${host}`).origin;

	return {
		host,
		hostname: host.split(":")[0]?.trim().toLowerCase() ?? "",
		origin,
		protocol,
	};
};

const getCookieOptions = (request: Request, maxAge?: number, shared = false) => {
	const { hostname, protocol } = getRequestDetails(request);
	const domain = shared
		? SHARED_DOMAINS.find(
				(candidate) =>
					hostname === candidate || hostname.endsWith(`.${candidate}`),
			)
		: undefined;

	return {
		domain: domain ? `.${domain}` : undefined,
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

const getGoogle = (request: Request) => {
	const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
	const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

	if (!(clientId && clientSecret)) {
		throw new Error("Google OAuth credentials are not configured.");
	}

	return new Google(
		clientId,
		clientSecret,
		`${getRequestDetails(request).origin}/api/login/google/callback`,
	);
};

const getAuthPage = (flow: AuthFlow) =>
	flow === "register" ? "/register" : "/login";

const getErrorResponse = (request: Request, flow: AuthFlow) => {
	const url = new URL(getAuthPage(flow), getRequestDetails(request).origin);
	url.searchParams.set("error", "Google sign-in failed. Please try again.");

	return redirectResponse(url);
};

const getAppUrl = (request: Request) => {
	const configuredAppUrl = process.env.SELFMAIL_APP_URL?.trim();

	if (configuredAppUrl) {
		return configuredAppUrl;
	}

	const { hostname, origin } = getRequestDetails(request);

	if (hostname === DEV_DOMAIN || hostname.endsWith(`.${DEV_DOMAIN}`)) {
		return `https://dashboard.${DEV_DOMAIN}`;
	}

	if (
		hostname === LEGACY_DEV_DOMAIN ||
		hostname.endsWith(`.${LEGACY_DEV_DOMAIN}`)
	) {
		return `http://${LEGACY_DEV_DOMAIN}`;
	}

	if (hostname === PROD_DOMAIN || hostname.endsWith(`.${PROD_DOMAIN}`)) {
		return `https://dashboard.${PROD_DOMAIN}`;
	}

	return origin;
};

const clearOAuthCookies = (request: Request) => {
	const options = getCookieOptions(request);

	for (const name of [
		STATE_COOKIE_NAME,
		CODE_VERIFIER_COOKIE_NAME,
		REDIRECT_COOKIE_NAME,
		FLOW_COOKIE_NAME,
	]) {
		deleteCookie(name, options);
	}
};

const hashToken = (token: string) =>
	crypto.createHash("sha256").update(token).digest("hex");

function redirectResponse(location: string | URL) {
	return new Response(null, {
		headers: { Location: new URL(location).toString() },
		status: 302,
	});
}

export const startGoogleOAuth = (request: Request) => {
	const requestUrl = new URL(request.url);
	const flow: AuthFlow =
		requestUrl.searchParams.get("flow") === "register" ? "register" : "login";

	try {
		const state = generateState();
		const codeVerifier = generateCodeVerifier();
		const redirectPath = normalizeRedirect(requestUrl.searchParams.get("redirect"));
		const cookieOptions = getCookieOptions(request, OAUTH_COOKIE_MAX_AGE);

		setCookie(STATE_COOKIE_NAME, state, cookieOptions);
		setCookie(CODE_VERIFIER_COOKIE_NAME, codeVerifier, cookieOptions);
		setCookie(FLOW_COOKIE_NAME, flow, cookieOptions);

		if (redirectPath) {
			setCookie(REDIRECT_COOKIE_NAME, redirectPath, cookieOptions);
		} else {
			deleteCookie(REDIRECT_COOKIE_NAME, getCookieOptions(request));
		}

		const authorizationUrl = getGoogle(request).createAuthorizationURL(
			state,
			codeVerifier,
			["openid", "profile", "email"],
		);

		return redirectResponse(authorizationUrl);
	} catch (error) {
		logger.error(
			"Google OAuth authorization failed to start",
			error instanceof Error ? error : undefined,
		);
		clearOAuthCookies(request);
		return getErrorResponse(request, flow);
	}
};

export const finishGoogleOAuth = async (request: Request) => {
	const requestUrl = new URL(request.url);
	const flow: AuthFlow =
		getCookie(FLOW_COOKIE_NAME) === "register" ? "register" : "login";
	const storedState = getCookie(STATE_COOKIE_NAME);
	const codeVerifier = getCookie(CODE_VERIFIER_COOKIE_NAME);
	const redirectPath = normalizeRedirect(getCookie(REDIRECT_COOKIE_NAME));
	const code = requestUrl.searchParams.get("code");
	const state = requestUrl.searchParams.get("state");
	const providerError = requestUrl.searchParams.get("error");

	clearOAuthCookies(request);

	if (
		providerError ||
		!(code && state && storedState && codeVerifier) ||
		state !== storedState
	) {
		logger.warn("Google OAuth callback rejected", {
			providerError,
			reason: providerError ? "provider_error" : "invalid_state_or_code",
		});
		return getErrorResponse(request, flow);
	}

	try {
		const tokens = await getGoogle(request).validateAuthorizationCode(
			code,
			codeVerifier,
		);
		const userInfoResponse = await fetch(
			"https://openidconnect.googleapis.com/v1/userinfo",
			{
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${tokens.accessToken()}`,
				},
				signal: AbortSignal.timeout(10_000),
			},
		);

		if (!userInfoResponse.ok) {
			throw new Error(
				`Google userinfo request failed with status ${userInfoResponse.status}.`,
			);
		}

		const googleUser = googleUserSchema.parse(await userInfoResponse.json());
		const rawSessionToken = crypto.randomBytes(32).toString("base64url");

		await db.$transaction(async (tx) => {
			const googleAccount = await tx.account.findUnique({
				select: { userId: true },
				where: {
					provider_providerAccountId: {
						provider: "GOOGLE",
						providerAccountId: googleUser.sub,
					},
				},
			});
			let userId = googleAccount?.userId;

			if (userId) {
				await tx.user.update({
					data: {
						emailVerified: new Date(),
						image: googleUser.picture,
						name: googleUser.name,
					},
					where: { id: userId },
				});
			} else {
				const existingUser = await tx.user.findFirst({
					select: { id: true },
					where: {
						email: { equals: googleUser.email, mode: "insensitive" },
					},
				});

				if (existingUser) {
					userId = existingUser.id;
					await tx.user.update({
						data: {
							emailVerified: new Date(),
							image: googleUser.picture,
							name: googleUser.name,
							accounts: {
								create: {
									provider: "GOOGLE",
									providerAccountId: googleUser.sub,
								},
							},
						},
						where: { id: userId },
					});
				} else {
					const user = await tx.user.create({
						data: {
							accounts: {
								create: {
									provider: "GOOGLE",
									providerAccountId: googleUser.sub,
								},
							},
							email: googleUser.email,
							emailVerified: new Date(),
							image: googleUser.picture,
							name: googleUser.name,
						},
						select: { id: true },
					});
					userId = user.id;
				}
			}

			await tx.session.create({
				data: {
					expires: new Date(Date.now() + SESSION_MAX_AGE * 1000),
					sessionToken: hashToken(rawSessionToken),
					userId,
				},
			});
		});

		setCookie(
			SESSION_COOKIE_NAME,
			rawSessionToken,
			getCookieOptions(request, SESSION_MAX_AGE, true),
		);
		logger.info("Google OAuth sign-in succeeded", {
			providerAccountId: googleUser.sub,
		});

		return redirectResponse(
			redirectPath
				? new URL(redirectPath, getRequestDetails(request).origin)
				: getAppUrl(request),
		);
	} catch (error) {
		logger.error(
			"Google OAuth callback failed",
			error instanceof Error ? error : undefined,
		);
		return getErrorResponse(request, flow);
	}
};
