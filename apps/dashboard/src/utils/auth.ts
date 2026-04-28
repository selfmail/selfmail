import { Authentication } from "@selfmail/authentication";
import type { User } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

const logger = createLogger("dashboard-auth-middleware");
const PROD_AUTH_HREF = "https://auth.selfmail.app/login";
const DEV_AUTH_HREF = "https://auth.selfmail.localhost/login";

const authentication = new Authentication({ identifier: "dashboard" });

type CurrentUserResult =
	| {
			status: "authenticated";
			user: User;
	  }
	| {
			status: "unauthenticated";
			loginHref: string;
	  };

const unauthenticated = (message: string): CurrentUserResult => {
	logger.warn(message);

	return {
		status: "unauthenticated",
		loginHref: getLoginHref(),
	};
};

export const getCurrentUserFn = createServerFn({
	method: "GET",
}).handler(async (): Promise<CurrentUserResult> => {
	const token = getCookie("selfmail-session-token");

	if (!token) {
		return unauthenticated("No session token found in cookies");
	}

	try {
		const user = await authentication.getCurrentUser({ token });
		if (!user) {
			return unauthenticated("No user found for provided session token");
		}

		return {
			status: "authenticated",
			user,
		};
	} catch (error: unknown) {
		if (
			error instanceof Error &&
			error.message.includes("Rate limit exceeded")
		) {
			return unauthenticated("Rate limit exceeded while fetching current user");
		}
		logger.error(
			"Error fetching current user",
			error instanceof Error ? error : undefined,
		);

		return {
			status: "unauthenticated",
			loginHref: getLoginHref(),
		};
	}
});

export const getLoginHref = createServerOnlyFn(() => {
	if (typeof window === "undefined") {
		return process.env.SELFMAIL_AUTH_URL
			? new URL("/login", process.env.SELFMAIL_AUTH_URL).toString()
			: DEV_AUTH_HREF;
	}

	return window.location.hostname.endsWith(".selfmail.app") ||
		window.location.hostname === "selfmail.app"
		? PROD_AUTH_HREF
		: DEV_AUTH_HREF;
});
