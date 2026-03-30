import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import {
	deleteCookie,
	getCookie,
	getRequestHost,
	getRequestProtocol,
	getRequestUrl,
	setCookie,
} from "@tanstack/react-start/server";
import {
	ArcticFetchError,
	Google,
	generateCodeVerifier,
	generateState,
	OAuth2RequestError,
	type OAuth2Tokens,
	UnexpectedErrorResponseBodyError,
	UnexpectedResponseError,
} from "arctic";
import { z } from "zod";
import { SessionUtils } from "#/utils/session.server";

const logger = createLogger("auth-google-oauth");
const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";
const GOOGLE_CODE_VERIFIER_COOKIE = "google_code_verifier";
const GOOGLE_CALLBACK_PATH = "/api/callback/google";
const GOOGLE_SCOPES = ["openid", "email", "profile"] as const;
const PROD_SHARED_DOMAIN = "selfmail.app";

const googleUserSchema = z.object({
	email: z.email(),
	email_verified: z.boolean(),
	name: z.string().trim().min(1).nullable().optional(),
	picture: z.url().nullable().optional(),
	sub: z.string().trim().min(1),
});

const redirect = (url: string | URL) =>
	new Response(null, {
		headers: {
			Location: url.toString(),
		},
		status: 302,
	});

export abstract class OAuthUtils {
	private static normalizeHost(host: string) {
		return host.split(":")[0].trim().toLowerCase();
	}

	private static getOAuthCookieOptions() {
		const hostname = OAuthUtils.normalizeHost(
			getRequestHost({ xForwardedHost: true }),
		);
		const protocol = getRequestProtocol({ xForwardedProto: true });

		return {
			httpOnly: true,
			maxAge: 60 * 10,
			path: "/",
			sameSite: "lax" as const,
			secure:
				protocol === "https" ||
				hostname === PROD_SHARED_DOMAIN ||
				hostname.endsWith(`.${PROD_SHARED_DOMAIN}`),
		};
	}

	private static getAuthUrl(path: string, error?: string) {
		const url = getRequestUrl({
			xForwardedHost: true,
			xForwardedProto: true,
		});

		url.pathname = path;
		url.search = "";

		if (error) {
			url.searchParams.set("error", error);
		}

		return url;
	}

	private static getGoogleRedirectUri() {
		const configuredRedirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();

		if (configuredRedirectUri) {
			return configuredRedirectUri;
		}

		return OAuthUtils.getAuthUrl(GOOGLE_CALLBACK_PATH).toString();
	}

	private static clearGoogleOAuthCookies() {
		const cookieOptions = OAuthUtils.getOAuthCookieOptions();

		deleteCookie(GOOGLE_OAUTH_STATE_COOKIE, cookieOptions);
		deleteCookie(GOOGLE_CODE_VERIFIER_COOKIE, cookieOptions);
	}

	private static getGoogle() {
		const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
		const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

		if (!(clientId && clientSecret)) {
			throw new Error("Google OAuth is not configured.");
		}

		return new Google(
			clientId,
			clientSecret,
			OAuthUtils.getGoogleRedirectUri(),
		);
	}

	private static async getGoogleUser(tokens: OAuth2Tokens) {
		const response = await fetch(
			"https://openidconnect.googleapis.com/v1/userinfo",
			{
				headers: {
					Authorization: `Bearer ${tokens.accessToken()}`,
				},
			},
		);

		if (!response.ok) {
			throw new Error(
				`Google userinfo request failed with ${response.status}.`,
			);
		}

		return googleUserSchema.parse(await response.json());
	}

	private static async upsertGoogleUser({
		googleUser,
		tokens,
	}: {
		googleUser: z.infer<typeof googleUserSchema>;
		tokens: OAuth2Tokens;
	}) {
		const existingAccount = await db.account.findUnique({
			include: {
				user: true,
			},
			where: {
				provider_providerAccountId: {
					provider: "GOOGLE",
					providerAccountId: googleUser.sub,
				},
			},
		});

		const existingUserByEmail =
			existingAccount?.user ??
			(await db.user.findFirst({
				where: {
					email: googleUser.email,
				},
			}));

		const user =
			existingUserByEmail ??
			(await db.user.create({
				data: {
					email: googleUser.email,
					emailVerified: new Date(),
					image: googleUser.picture ?? undefined,
					name: googleUser.name ?? undefined,
				},
			}));

		await db.$transaction(async (tx) => {
			await tx.user.update({
				data: {
					email: googleUser.email,
					emailVerified: new Date(),
					image: googleUser.picture ?? user.image ?? undefined,
					name: googleUser.name ?? user.name ?? undefined,
				},
				where: {
					id: user.id,
				},
			});

			await tx.account.upsert({
				create: {
					accessToken: tokens.accessToken(),
					expiresAt: Math.floor(tokens.accessTokenExpiresAt().getTime() / 1000),
					provider: "GOOGLE",
					providerAccountId: googleUser.sub,
					refreshToken: tokens.hasRefreshToken()
						? tokens.refreshToken()
						: null,
					scope: tokens.hasScopes() ? tokens.scopes().join(" ") : null,
					tokenType: tokens.tokenType(),
					userId: user.id,
				},
				update: {
					accessToken: tokens.accessToken(),
					expiresAt: Math.floor(tokens.accessTokenExpiresAt().getTime() / 1000),
					refreshToken: tokens.hasRefreshToken()
						? tokens.refreshToken()
						: (existingAccount?.refreshToken ?? null),
					scope: tokens.hasScopes() ? tokens.scopes().join(" ") : null,
					tokenType: tokens.tokenType(),
					userId: user.id,
				},
				where: {
					provider_providerAccountId: {
						provider: "GOOGLE",
						providerAccountId: googleUser.sub,
					},
				},
			});
		});

		return user;
	}

	private static async getPostLoginRedirectUrl(userId: string) {
		const appUrl = SessionUtils.getAppRedirectUrl();
		const membership = await db.member.findFirst({
			where: {
				userId,
			},
		});

		return membership ? appUrl : new URL("/create", appUrl).toString();
	}

	static startGoogle() {
		try {
			const google = OAuthUtils.getGoogle();
			const state = generateState();
			const codeVerifier = generateCodeVerifier();
			const cookieOptions = OAuthUtils.getOAuthCookieOptions();
			const authorizationUrl = google.createAuthorizationURL(
				state,
				codeVerifier,
				[...GOOGLE_SCOPES],
			);

			setCookie(GOOGLE_OAUTH_STATE_COOKIE, state, cookieOptions);
			setCookie(GOOGLE_CODE_VERIFIER_COOKIE, codeVerifier, cookieOptions);

			return redirect(authorizationUrl);
		} catch (error) {
			logger.error(
				"Failed to start Google OAuth",
				error instanceof Error ? error : undefined,
			);

			return redirect(
				OAuthUtils.getAuthUrl(
					"/login",
					"Google sign-in is not configured right now. Please try email instead.",
				),
			);
		}
	}

	static async finishGoogle(request: Request) {
		const requestId = crypto.randomUUID();
		const url = new URL(request.url);
		const code = url.searchParams.get("code");
		const state = url.searchParams.get("state");
		const storedState = getCookie(GOOGLE_OAUTH_STATE_COOKIE);
		const codeVerifier = getCookie(GOOGLE_CODE_VERIFIER_COOKIE);

		if (
			!(code && state && storedState && codeVerifier) ||
			state !== storedState
		) {
			OAuthUtils.clearGoogleOAuthCookies();
			return redirect(
				OAuthUtils.getAuthUrl("/login", "Invalid Google sign-in request."),
			);
		}

		try {
			const google = OAuthUtils.getGoogle();
			const tokens = await google.validateAuthorizationCode(code, codeVerifier);
			const googleUser = await OAuthUtils.getGoogleUser(tokens);

			if (!googleUser.email_verified) {
				OAuthUtils.clearGoogleOAuthCookies();
				return redirect(
					OAuthUtils.getAuthUrl(
						"/login",
						"Your Google email address must be verified.",
					),
				);
			}

			const user = await OAuthUtils.upsertGoogleUser({
				googleUser,
				tokens,
			});

			OAuthUtils.clearGoogleOAuthCookies();
			await SessionUtils.createSession(user.id);

			return redirect(await OAuthUtils.getPostLoginRedirectUrl(user.id));
		} catch (error) {
			OAuthUtils.clearGoogleOAuthCookies();

			const isKnownOAuthError =
				error instanceof OAuth2RequestError ||
				error instanceof ArcticFetchError ||
				error instanceof UnexpectedResponseError ||
				error instanceof UnexpectedErrorResponseBodyError;

			logger.error(
				"Google OAuth callback failed",
				error instanceof Error ? error : undefined,
				{ isKnownOAuthError, requestId },
			);

			return redirect(
				OAuthUtils.getAuthUrl(
					"/login",
					"Google sign-in failed. Please try again or use email instead.",
				),
			);
		}
	}
}
