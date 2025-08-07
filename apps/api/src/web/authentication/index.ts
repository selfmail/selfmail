import Elysia, { status, t } from "elysia";
import { sessionAuthMiddleware } from "../../lib/auth-middleware";
import { AuthenticationModule } from "./module";
import { AuthenticationService } from "./service";

const sessionTokenSchema = t.Cookie({
	"session-token": t.String({
		description: "Session token for authentication",
	}),
});

export const requireAuthentication = new Elysia({
	name: "Auth.Service",
	detail: {
		description: "Authentication plugin for protected routes",
	},
})
	.macro({
		isSignIn: {
			async resolve({ cookie, status }) {
				if (!cookie["session-token"]?.value) return status(401);

				const authUser = await sessionAuthMiddleware({
					cookie: cookie["session-token"]
						? `session-token=${cookie["session-token"]}`
						: "",
				});

				if (!authUser) {
					throw status(401, "Authentication required");
				}

				return { user: authUser };
			},
		},
	})
	.as("global");

export const authentication = new Elysia({
	prefix: "/authentication",
	detail: {
		description: "Authentication endpoints for user registration and login.",
	},
})
	.post(
		"/login",
		async ({ body, request, cookie }) => {
			const clientIp =
				request.headers.get("x-forwarded-for") ||
				request.headers.get("x-real-ip") ||
				"unknown";

			const result = await AuthenticationService.handleLogin(body, clientIp);

			cookie["session-token"].value = result.sessionToken;
			cookie["session-token"].httpOnly = true;
			cookie["session-token"].secure = true;
			cookie["session-token"].sameSite = "strict";
			cookie["session-token"].path = "/";
			cookie["session-token"].maxAge = 604800; // 7 days

			return result;
		},
		{
			body: AuthenticationModule.loginBody,
			detail: {
				description: "Login with email and password",
			},
			cookie: sessionTokenSchema,
		},
	)
	.post(
		"/register",
		async ({ body, request, cookie }) => {
			const clientIp =
				request.headers.get("x-forwarded-for") ||
				request.headers.get("x-real-ip") ||
				"unknown";

			const result = await AuthenticationService.handleRegister(body, clientIp);

			cookie["session-token"].value = result.sessionToken;
			cookie["session-token"].httpOnly = true;
			cookie["session-token"].secure = true;
			cookie["session-token"].sameSite = "strict";
			cookie["session-token"].path = "/";
			cookie["session-token"].maxAge = 604800; // 7 days

			return result;
		},
		{
			body: AuthenticationModule.registerBody,
			detail: {
				description: "Register a new user account",
			},
			cookie: sessionTokenSchema,
		},
	)
	.post(
		"/logout",
		async ({ cookie }) => {
			const sessionToken = cookie["session-token"]?.value;

			if (!sessionToken) {
				throw status(401, "Not authenticated");
			}

			if (sessionToken) {
				await AuthenticationService.handleLogout(sessionToken);
			}

			cookie["session-token"].remove();

			return { success: true, message: "Logged out successfully" };
		},
		{
			detail: {
				description: "Logout and clear session",
			},
			cookie: sessionTokenSchema,
		},
	)
	.use(requireAuthentication)
	.get("/me", async ({ user }) => user, {
		detail: {
			description: "Get current user information",
		},
		cookie: sessionTokenSchema,
		isSignIn: true,
	});
