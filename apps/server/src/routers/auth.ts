import { TRPCError } from "@trpc/server";
import {
	createSessionCookie,
	loginSchema,
	registerSchema,
	SESSION_CONFIG,
} from "../lib/auth";
import {
	AuthError,
	loginUser,
	logoutUser,
	registerUser,
} from "../lib/auth-service";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";

export const authRouter = router({
	// Register new user
	register: publicProcedure
		.input(registerSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const user = await registerUser(input);

				// Auto-login after registration by creating a session
				const { sessionToken } = await loginUser({
					email: input.email,
					password: input.password,
				});

				// Set session cookie
				const cookieString = createSessionCookie(sessionToken);
				ctx.honoContext.header("Set-Cookie", cookieString);

				return {
					success: true,
					user,
					message: "User registered successfully and logged in",
				};
			} catch (error) {
				if (error instanceof AuthError) {
					throw new TRPCError({
						code: error.code === "USER_EXISTS" ? "CONFLICT" : "BAD_REQUEST",
						message: error.message,
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to register user",
				});
			}
		}),

	// Login user
	login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
		try {
			const { user, sessionToken } = await loginUser(input);

			// Set session cookie via Hono context
			const cookieString = createSessionCookie(sessionToken);
			ctx.honoContext.header("Set-Cookie", cookieString);

			return {
				success: true,
				user,
				message: "Login successful",
			};
		} catch (error) {
			if (error instanceof AuthError) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: error.message,
				});
			}
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to login user",
			});
		}
	}),

	// Logout user
	logout: protectedProcedure.mutation(async ({ ctx }) => {
		if (ctx.sessionToken) {
			await logoutUser(ctx.sessionToken);
		}

		// Clear session cookie
		ctx.honoContext.header(
			"Set-Cookie",
			`${SESSION_CONFIG.cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=lax`,
		);

		return {
			success: true,
			message: "Logout successful",
		};
	}),

	// Get current user
	me: protectedProcedure.query(async ({ ctx }) => {
		return {
			user: ctx.user,
		};
	}),

	// Check if user is authenticated
	isAuthenticated: publicProcedure.query(async ({ ctx }) => {
		return {
			isAuthenticated: !!ctx.user,
			user: ctx.user || null,
		};
	}),
});
