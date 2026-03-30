import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import {
	deleteCookie,
	getCookie,
	getRequestHost,
	getRequestProtocol,
	setCookie,
} from "@tanstack/react-start/server";

const PROD_SHARED_DOMAIN = "selfmail.app";
const DEV_SHARED_DOMAIN = "selfmail.local";
const DEV_LOCALHOST_DOMAIN = "selfmail.localhost";
const logger = createLogger("auth-session");

export const SESSION_COOKIE_NAME = "selfmail-session-token";
export const TEMP_SESSION_COOKIE_NAME = "selfmail-temp-session-token";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
const TEMP_SESSION_DURATION_SECONDS = 60 * 15;

const normalizeHost = (host: string) => host.split(":")[0].trim().toLowerCase();

const getCookieDomain = (host: string) => {
	const hostname = normalizeHost(host);

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
};

const getCookieConfig = (maxAge: number) => {
	const host = getRequestHost({ xForwardedHost: true });
	const hostname = normalizeHost(host);
	const protocol = getRequestProtocol({ xForwardedProto: true });

	return {
		domain: getCookieDomain(host),
		httpOnly: true,
		maxAge,
		path: "/",
		sameSite: "lax" as const,
		secure:
			protocol === "https" ||
			hostname === PROD_SHARED_DOMAIN ||
			hostname.endsWith(`.${PROD_SHARED_DOMAIN}`),
	};
};

const createToken = () => crypto.randomUUID().replaceAll("-", "");
export const createBrowserToken = createToken;

export const hashToken = async (value: string) => {
	const digest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(value),
	);

	return Array.from(new Uint8Array(digest), (part) =>
		part.toString(16).padStart(2, "0"),
	).join("");
};

export const createSession = async (userId: string) => {
	const rawToken = createToken();
	const sessionTokenHash = await hashToken(rawToken);
	const expires = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
	const host = getRequestHost({ xForwardedHost: true });
	const cookieDomain = getCookieDomain(host);

	await db.session.create({
		data: {
			expires,
			sessionToken: sessionTokenHash,
			userId,
		},
	});

	setCookie(
		SESSION_COOKIE_NAME,
		rawToken,
		getCookieConfig(SESSION_DURATION_SECONDS),
	);
	logger.info("Created auth session", {
		cookieDomain,
		expiresAt: expires.toISOString(),
		host,
		userId,
	});

	return {
		expires,
		sessionToken: rawToken,
	};
};

export const clearSessionCookie = () => {
	deleteCookie(SESSION_COOKIE_NAME, getCookieConfig(0));
};

export const setTempSessionCookie = (token: string) => {
	setCookie(
		TEMP_SESSION_COOKIE_NAME,
		token,
		getCookieConfig(TEMP_SESSION_DURATION_SECONDS),
	);
};

export const getTempSessionCookie = () => getCookie(TEMP_SESSION_COOKIE_NAME);

export const clearTempSessionCookie = () => {
	deleteCookie(TEMP_SESSION_COOKIE_NAME, getCookieConfig(0));
};

export const getAppRedirectUrl = () => {
	const appUrl = process.env.SELFMAIL_APP_URL?.trim();

	if (appUrl) {
		return appUrl;
	}

	const host = normalizeHost(getRequestHost({ xForwardedHost: true }));

	if (host === DEV_SHARED_DOMAIN || host.endsWith(`.${DEV_SHARED_DOMAIN}`)) {
		return `http://${DEV_SHARED_DOMAIN}`;
	}

	if (
		host === DEV_LOCALHOST_DOMAIN ||
		host.endsWith(`.${DEV_LOCALHOST_DOMAIN}`)
	) {
		return `http://${DEV_LOCALHOST_DOMAIN}`;
	}

	return `https://${PROD_SHARED_DOMAIN}`;
};

export const getCurrentUser = async () => {
	const host = getRequestHost({ xForwardedHost: true });
	const cookieDomain = getCookieDomain(host);
	const rawToken = getCookie(SESSION_COOKIE_NAME);

	logger.info("Resolving auth session", {
		cookieDomain,
		hasSessionCookie: Boolean(rawToken),
		host,
	});

	if (!rawToken) {
		return null;
	}

	const sessionTokenHash = await hashToken(rawToken);

	const session = await db.session.findUnique({
		include: {
			user: true,
		},
		where: {
			sessionToken: sessionTokenHash,
		},
	});

	if (!session) {
		logger.warn("Auth session cookie did not match a stored session", {
			cookieDomain,
			host,
			sessionTokenHashPrefix: sessionTokenHash.slice(0, 12),
		});
		clearSessionCookie();
		return null;
	}

	if (session.expires < new Date()) {
		logger.info("Auth session expired", {
			cookieDomain,
			host,
			sessionTokenHashPrefix: sessionTokenHash.slice(0, 12),
			userId: session.user.id,
		});
		await db.session.deleteMany({
			where: {
				sessionToken: sessionTokenHash,
			},
		});
		clearSessionCookie();

		return null;
	}

	logger.info("Resolved auth session", {
		cookieDomain,
		host,
		userId: session.user.id,
	});

	return session.user;
};

export const destroySession = async () => {
	const rawToken = getCookie(SESSION_COOKIE_NAME);

	if (rawToken) {
		const sessionTokenHash = await hashToken(rawToken);
		await db.session.deleteMany({
			where: {
				sessionToken: sessionTokenHash,
			},
		});
	}

	clearSessionCookie();
};
