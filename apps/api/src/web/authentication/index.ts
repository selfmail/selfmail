import Elysia from "elysia";
import { sessionAuthMiddleware } from "../../lib/auth-middleware";
import { AuthenticationModule } from "./module";
import { AuthenticationService } from "./service";

export const authentication = new Elysia({
	prefix: "/authentication",
	detail: {
		description: "Authentication endpoints for user registration and login.",
	},
})
	.post(
		"/login",
		async ({ body, request, set }) => {
			const clientIp =
				request.headers.get("x-forwarded-for") ||
				request.headers.get("x-real-ip") ||
				"unknown";

			const result = await AuthenticationService.handleLogin(body, clientIp);

			// Set session cookie
			set.headers["Set-Cookie"] =
				`session-token=${result.sessionToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`; // 7 days

			return result;
		},
		{
			body: AuthenticationModule.loginBody,
			detail: {
				description: "Login with email and password",
			},
		},
	)
	.post(
		"/register",
		async ({ body, request, set }) => {
			const clientIp =
				request.headers.get("x-forwarded-for") ||
				request.headers.get("x-real-ip") ||
				"unknown";

			const result = await AuthenticationService.handleRegister(body, clientIp);

			// Set session cookie
			set.headers["Set-Cookie"] =
				`session-token=${result.sessionToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`; // 7 days

			return result;
		},
		{
			body: AuthenticationModule.registerBody,
			detail: {
				description: "Register a new user account",
			},
		},
	)
	.post(
		"/logout",
		async ({ request, set }) => {
			const cookieHeader = request.headers.get("cookie");
			const sessionToken = extractSessionToken(cookieHeader);

			if (sessionToken) {
				await AuthenticationService.handleLogout(sessionToken);
			}

			// Clear session cookie
			set.headers["Set-Cookie"] =
				"session-token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0";

			return { success: true, message: "Logged out successfully" };
		},
		{
			detail: {
				description: "Logout and clear session",
			},
		},
	)
	.get(
		"/me",
		async ({ request, set }) => {
			const authUser = await sessionAuthMiddleware(
				Object.fromEntries(request.headers.entries()),
			);

			if (!authUser) {
				set.status = 401;
				throw new Error("Authentication required");
			}

			return await AuthenticationService.handleMe(authUser.id);
		},
		{
			detail: {
				description: "Get current user information",
			},
		},
	);

// Helper function to extract session token from cookies
function extractSessionToken(cookieHeader: string | null): string | null {
	if (!cookieHeader) return null;

	const cookies = cookieHeader
		.split(";")
		.map((cookie) => cookie.trim())
		.reduce(
			(acc, cookie) => {
				const [key, value] = cookie.split("=");
				if (key && value) {
					acc[key] = value;
				}
				return acc;
			},
			{} as Record<string, string>,
		);

	return cookies["session-token"] || null;
}

export const requireAuthentication = new Elysia({
	detail: {
		description: "Required Authentication for dashboard and workspace routes.",
	},
})
	.state("user", "")
	.derive(({ store }) => ({
		user({ email }: { email: string }) {
			store.user = email;
		},
	}))
	.onBeforeHandle(async ({ request, set }) => {
		const authUser = await sessionAuthMiddleware(
			Object.fromEntries(request.headers.entries()),
		);

		if (!authUser) {
			set.status = 401;
			throw new Error("Authentication required");
		}

		return { authUser };
	});
