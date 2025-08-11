import { db } from "database";
import { status } from "elysia";
import { rateLimitMiddleware } from "../../lib/auth-middleware";
import type { AuthenticationModule } from "./module";

export abstract class AuthenticationService {
	static async handleRegister(
		{ email, password, name }: AuthenticationModule.RegisterBody,
		clientIp: string,
	) {
		// Rate limiting for registration
		const rateLimit = await rateLimitMiddleware(clientIp, "auth");
		if (!rateLimit.success) {
			return status(429, "Too many requests. Please try again later.");
		}

		// Check if the user already exists
		const existingUser = await db.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return status(409, "Email already registered. Please log in instead.");
		}

		// Hash password
		const passwordHash = await Bun.password.hash(password, "argon2id");

		// Create user
		const user = await db.user.create({
			data: {
				email,
				password: passwordHash,
				name,
			},
		});

		if (!user)
			throw status(500, "Failed to create user. Please try again later.");

		// Create session token
		const sessionToken = crypto.randomUUID();

		// Create session
		await db.session.create({
			data: {
				token: sessionToken,
				userId: user.id,
			},
		});

		return {
			success: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
			sessionToken,
		};
	}

	static async handleLogin(
		{ email, password }: AuthenticationModule.LoginBody,
		clientIp: string,
	) {
		// Rate limiting for login
		const rateLimit = await rateLimitMiddleware(clientIp, "auth");
		if (!rateLimit.success) {
			throw status(429, {
				success: false,
				message: "Too many requests. Please try again later.",
			});
		}

		const user = await db.user.findUnique({
			where: { email },
		});

		if (!user || !(await Bun.password.verify(password, user.password))) {
			throw status(401, {
				success: false,
				message: "Invalid email or password",
			});
		}

		// Create session token
		const sessionToken = crypto.randomUUID();

		// Create session (delete existing sessions for this user first)
		await db.session.deleteMany({
			where: { userId: user.id },
		});

		const session = await db.session.create({
			data: {
				token: sessionToken,
				userId: user.id,
			},
		});

		if (!session)
			throw status(500, {
				success: false,
				message: "Failed to create session",
			});

		return {
			success: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
			sessionToken,
		};
	}

	static async handleLogout(sessionToken: string) {
		await db.session.deleteMany({
			where: { token: sessionToken },
		});

		return {
			success: true,
			message: "Logged out successfully",
		};
	}

	static async handleMe(userId: string) {
		const user = await db.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
			},
		});

		if (!user) {
			throw status(404, "User not found");
		}

		return {
			user,
		};
	}
}
