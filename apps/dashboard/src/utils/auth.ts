import { Authentication } from "@selfmail/authentication";
import type { User } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { redirect } from "@tanstack/react-router";
import {
	createMiddleware,
	createServerFn,
	createServerOnlyFn,
} from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

const logger = createLogger("dashboard-auth-middleware");
const productionLoginHref = "https://auth.selfmail.app/login";
const developmentLoginHref = "https://auth.selfmail.localhost/login";

const authentication = new Authentication({ identifier: "dashboard" });

interface AuthenticatedUserResult {
	status: "authenticated";
	user: User;
}

interface UnauthenticatedUserResult {
	loginHref: string;
	status: "unauthenticated";
}

type CurrentUserResult = AuthenticatedUserResult | UnauthenticatedUserResult;

const unauthenticated = (message: string): CurrentUserResult => {
	logger.warn(message);

	return {
		status: "unauthenticated",
		loginHref: getLoginHref(),
	};
};

const getCurrentUserFn = createServerFn({
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

const getLoginHref = createServerOnlyFn(() => {
	if (typeof window === "undefined") {
		return process.env.SELFMAIL_AUTH_URL
			? new URL("/login", process.env.SELFMAIL_AUTH_URL).toString()
			: developmentLoginHref;
	}

	return window.location.hostname.endsWith(".selfmail.app") ||
		window.location.hostname === "selfmail.app"
		? productionLoginHref
		: developmentLoginHref;
});

export const authMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		const currentUserResult = await getCurrentUserFn();

		if (currentUserResult.status === "unauthenticated") {
			throw redirect({
				href: currentUserResult.loginHref,
			});
		}

		return next({
			context: {
				user: currentUserResult.user,
			},
		});
	},
);
