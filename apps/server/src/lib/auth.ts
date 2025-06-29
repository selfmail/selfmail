import { z } from "zod";

/**
 * Authentication utilities using Bun's built-in password hashing
 */

// Validation schemas
export const registerSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
	name: z.string().min(1, "Name is required"),
});

export const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Hash a password using Bun's built-in password hashing
 */
export async function hashPassword(password: string): Promise<string> {
	return await Bun.password.hash(password, {
		algorithm: "bcrypt",
		cost: 12, // Higher cost = more secure but slower
	});
}

/**
 * Verify a password against a hash using Bun's built-in verification
 */
export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return await Bun.password.verify(password, hash);
}

/**
 * Generate a random session token
 */
export function generateSessionToken(): string {
	return crypto.randomUUID();
}

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
	maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
	cookieName: "session-token",
	cookieOptions: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		path: "/",
	},
};

/**
 * Extract session token from cookies
 */
export function extractSessionToken(
	cookieHeader: string | undefined,
): string | null {
	if (!cookieHeader) return null;

	const cookies = cookieHeader
		.split(";")
		.map((cookie) => cookie.trim())
		.reduce(
			(acc, cookie) => {
				const [key, value] = cookie.split("=");
				acc[key] = value;
				return acc;
			},
			{} as Record<string, string>,
		);

	return cookies[SESSION_CONFIG.cookieName] || null;
}

/**
 * Create session cookie string
 */
export function createSessionCookie(token: string): string {
	const options = SESSION_CONFIG.cookieOptions;
	const expires = new Date(Date.now() + SESSION_CONFIG.maxAge);

	let cookieString = `${SESSION_CONFIG.cookieName}=${token}`;
	cookieString += `; Path=${options.path}`;
	cookieString += `; Expires=${expires.toUTCString()}`;
	cookieString += `; Max-Age=${Math.floor(SESSION_CONFIG.maxAge / 1000)}`;
	cookieString += `; SameSite=${options.sameSite}`;

	if (options.httpOnly) {
		cookieString += "; HttpOnly";
	}

	if (options.secure) {
		cookieString += "; Secure";
	}

	return cookieString;
}

/**
 * Create logout cookie string (expires immediately)
 */
export function createLogoutCookie(): string {
	return `${SESSION_CONFIG.cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly`;
}
