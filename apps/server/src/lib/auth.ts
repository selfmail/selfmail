import bcrypt from "bcrypt";
import { z } from "zod";

/**
 * Authentication utilities using bcrypt for password hashing
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
	username: z.string().min(3, "Username must be at least 3 characters"),
	emailLoop: z.boolean().optional().default(false),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
	const saltRounds = 12; // Higher cost = more secure but slower
	return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash using bcrypt
 */
export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return await bcrypt.compare(password, hash);
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
