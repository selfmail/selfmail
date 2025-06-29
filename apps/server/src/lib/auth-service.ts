import { and, eq, gt } from "drizzle-orm";
import { db, type PublicUser, type Session, sessions, users } from "../db";
import {
	generateSessionToken,
	hashPassword,
	type LoginInput,
	type RegisterInput,
	SESSION_CONFIG,
	verifyPassword,
} from "./auth";

/**
 * Authentication service functions
 */

export class AuthError extends Error {
	constructor(
		message: string,
		public code: string,
	) {
		super(message);
		this.name = "AuthError";
	}
}

/**
 * Register a new user
 */
export async function registerUser(input: RegisterInput): Promise<PublicUser> {
	// Check if user already exists
	const existingUser = await db.query.users.findFirst({
		where: eq(users.email, input.email),
	});

	if (existingUser) {
		throw new AuthError("User with this email already exists", "USER_EXISTS");
	}

	// Hash password
	const passwordHash = await hashPassword(input.password);

	// Create user
	const [newUser] = await db
		.insert(users)
		.values({
			email: input.email,
			name: input.name,
			passwordHash,
		})
		.returning();

	// Return user without password hash
	const { passwordHash: _, ...publicUser } = newUser;
	return publicUser;
}

/**
 * Login user and create session
 */
export async function loginUser(
	input: LoginInput,
): Promise<{ user: PublicUser; sessionToken: string }> {
	// Find user by email
	const user = await db.query.users.findFirst({
		where: eq(users.email, input.email),
	});

	if (!user) {
		throw new AuthError("Invalid email or password", "INVALID_CREDENTIALS");
	}

	// Verify password
	const isValidPassword = await verifyPassword(
		input.password,
		user.passwordHash,
	);
	if (!isValidPassword) {
		throw new AuthError("Invalid email or password", "INVALID_CREDENTIALS");
	}

	// Generate session token
	const sessionToken = generateSessionToken();
	const expiresAt = new Date(Date.now() + SESSION_CONFIG.maxAge);

	// Create session
	await db.insert(sessions).values({
		id: sessionToken,
		userId: user.id,
		expiresAt,
	});

	// Return user without password hash and session token
	const { passwordHash: _, ...publicUser } = user;
	return { user: publicUser, sessionToken };
}

/**
 * Validate session and get user
 */
export async function validateSession(
	sessionToken: string,
): Promise<{ user: PublicUser; session: Session } | null> {
	// Find session with user
	const result = await db.query.sessions.findFirst({
		where: and(
			eq(sessions.id, sessionToken),
			gt(sessions.expiresAt, new Date()), // Check if session is not expired
		),
		with: {
			user: true,
		},
	});

	if (!result) {
		return null;
	}

	// Return user without password hash
	const { passwordHash: _, ...publicUser } = result.user;
	return {
		user: publicUser,
		session: result,
	};
}

/**
 * Logout user (delete session)
 */
export async function logoutUser(sessionToken: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionToken));
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<PublicUser | null> {
	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});

	if (!user) {
		return null;
	}

	const { passwordHash: _, ...publicUser } = user;
	return publicUser;
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
	await db.delete(sessions).where(eq(sessions.expiresAt, new Date()));
}
