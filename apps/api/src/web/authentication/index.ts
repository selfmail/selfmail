import { db } from "database";
import Elysia, { status, t } from "elysia";
import { sessionAuthMiddleware } from "../../lib/auth-middleware";
import { AuthenticationModule } from "./module";
import { AuthenticationService } from "./service";

export const requireAuthentication = new Elysia({
	name: "auth-plugin",
	detail: {
		description: "Authentication plugin for Elysia",
	},
})
	.model({
		session: t.Cookie({
			"session-token": t.String({
				description: "Session token for authentication",
			}),
			"temp-session-token": t.Optional(
				t.String({
					description: "Temporary session token for two-factor authentication",
				}),
			),
		}),
	})
	.guard({
		cookie: "session",
	})
	.resolve(async ({ cookie, redirect }) => {
		const sessionToken = cookie["session-token"]?.value;
		const tempSessionToken = cookie["temp-session-token"]?.value;

		if (!sessionToken) {
			if (tempSessionToken) redirect("/auth/verify");
			throw status(401, "Authentication required");
		}

		const user = await sessionAuthMiddleware({
			cookie: `session-token=${sessionToken}`,
		});

		if (!user) {
			throw status(401, "Authentication required");
		}

		const verification = await db.emailVerification.findUnique({
			where: {
				email_userId: {
					email: user.email,
					userId: user.id,
				},
			},
		});

		if (!verification) {
			throw redirect("/auth/verify");
		}

		return { user };
	})
	.as("scoped");

export const requireWorkspaceMember = new Elysia({
	name: "workspace/member",
})
	.use(requireAuthentication)
	.guard({
		body: t.Object({
			workspaceId: t.String({
				description: "ID of the workspace to check membership for",
			}),
		}),
		cookie: "session",
	})
	.resolve(async ({ cookie, body: { workspaceId } }) => {
		const user = await sessionAuthMiddleware({
			cookie: `session-token=${cookie["session-token"]?.value}`,
		});
		if (!user) {
			throw status(401, "Authentication required");
		}

		const workspace = await db.workspace.findUnique({
			where: {
				id: workspaceId,
			},
		});

		if (!workspace) {
			return status(500, "Internal Server Error");
		}

		const member = await db.member.findUnique({
			where: {
				workspaceId_userId: {
					userId: user.id,
					workspaceId: workspace.id,
				},
			},
		});

		return { member, workspace };
	})
	.as("scoped");

export const authentication = new Elysia({
	prefix: "/authentication",
	detail: {
		description: "Authentication endpoints for user registration and login.",
	},
})
	.post(
		"/login",
		async (ctx) => {
			const { body, request, cookie, set } = ctx;
			const clientIp =
				request.headers.get("x-forwarded-for") ||
				request.headers.get("x-real-ip") ||
				"unknown";
			const result = await AuthenticationService.handleLogin(body, clientIp);
			if (!("sessionToken" in result)) {
				// result is a status() response
				if (
					typeof result === "object" &&
					"status" in result &&
					"body" in result
				) {
					set.status = Number(result.status);
					return { success: false, message: result.body };
				}
				set.status = 400;
				return { success: false, message: "Login failed" };
			}
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
		},
	)
	.post(
		"/register",
		async (ctx) => {
			const { body, request, cookie, set } = ctx;
			const clientIp =
				request.headers.get("x-forwarded-for") ||
				request.headers.get("x-real-ip") ||
				"unknown";
			const result = await AuthenticationService.handleRegister(body, clientIp);
			if (!("sessionToken" in result)) {
				if (
					typeof result === "object" &&
					"status" in result &&
					"body" in result
				) {
					set.status = Number(result.status);
					return { success: false, message: result.body };
				}
				set.status = 400;
				return { success: false, message: "Registration failed" };
			}
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
		},
	)
	.post(
		"/logout",
		async ({ cookie, set }) => {
			const sessionToken = cookie["session-token"]?.value;
			if (!sessionToken) {
				set.status = 401;
				return { success: false, message: "Not authenticated" };
			}
			await AuthenticationService.handleLogout(sessionToken);
			cookie["session-token"].remove();
			return { success: true, message: "Logged out successfully" };
		},
		{
			detail: {
				description: "Logout and clear session",
			},
			cookie: t.Cookie({
				"session-token": t.String({
					description: "Session token for authentication",
				}),
			}),
		},
	)
	.use(requireAuthentication)
	.get("/me", async ({ user }) => user, {
		isSignIn: true,
	})
	.use(requireWorkspaceMember)
	.get(
		"/me/workspace",
		async ({ user, member, workspace }) => {
			return { user, member, workspace };
		},
		{
			detail: {
				description: "Get current user information",
			},
		},
	);
