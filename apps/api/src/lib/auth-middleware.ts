import { verifyKey } from "@unkey/api";
import { db } from "database";
import { Ratelimit } from "services/ratelimit";

export interface AuthUser {
	id: string;
	email: string;
	name: string;
	workspaceId?: string;
}

export interface AuthContext {
	user: AuthUser;
	apiKey: string;
}

/**
 * Authentication middleware for Elysia routes
 * Verifies Unkey API key and adds user context
 */
export async function authMiddleware(
	headers: Record<string, string | undefined>,
): Promise<AuthContext | null> {
	const authorization = headers.authorization;

	if (!authorization || !authorization.startsWith("Bearer ")) {
		return null;
	}

	const apiKey = authorization.slice(7);

	try {
		// Verify the API key with Unkey
		const { result, error } = await verifyKey({
			apiId: process.env.UNKEY_API_ID ?? "",
			key: apiKey,
		});

		if (error || !result?.valid) {
			return null;
		}

		// Get user info from metadata or database
		const userId = result.ownerId;
		if (!userId) {
			return null;
		}

		// Fetch user from database
		const user = await db.user.findUnique({
			where: { id: userId },
			include: {
				member: {
					include: {
						workspace: true,
					},
					take: 1, // Get first workspace membership
				},
			},
		});

		if (!user) {
			return null;
		}

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				workspaceId: user.member[0]?.workspaceId,
			},
			apiKey,
		};
	} catch (error) {
		console.error("Auth middleware error:", error);
		return null;
	}
}

/**
 * Session-based authentication middleware
 * Uses session tokens stored in cookies
 */
export async function sessionAuthMiddleware(
	headers: Record<string, string | undefined>,
): Promise<AuthUser | null> {
	const cookieHeader = headers.cookie;

	if (!cookieHeader) {
		return null;
	}

	// Extract session token from cookies
	const sessionToken = extractSessionToken(cookieHeader);
	if (!sessionToken) {
		return null;
	}

	try {
		// Find active session
		const session = await db.session.findFirst({
			where: {
				token: sessionToken,
			},
			include: {
				user: {
					include: {
						member: {
							include: {
								workspace: true,
							},
							take: 1,
						},
					},
				},
			},
		});

		if (!session || !session.user) {
			return null;
		}

		return {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name,
			workspaceId: session.user.member[0]?.workspaceId,
		};
	} catch (error) {
		console.error("Session auth middleware error:", error);
		return null;
	}
}

/**
 * Rate limiting middleware with different limits for different operations
 */
export async function rateLimitMiddleware(
	identifier: string,
	type: "auth" | "dashboard" | "api" = "api",
	customLimit?: number,
): Promise<{
	success: boolean;
	limit: number;
	remaining: number;
	reset: number;
}> {
	try {
		let maxRequests: number;
		let windowInSeconds: number;

		switch (type) {
			case "auth":
				maxRequests = 10;
				windowInSeconds = 60; // 1 minute
				break;
			case "dashboard":
				maxRequests = 100;
				windowInSeconds = 60; // 1 minute
				break;
			default:
				maxRequests = customLimit ?? 50;
				windowInSeconds = 60; // 1 minute
		}

		const result = await Ratelimit.limit(identifier, {
			max: maxRequests,
			windowInSeconds,
		});

		return {
			success: result.success,
			limit: maxRequests,
			remaining: result.remaining,
			reset: Date.now() + result.resetIn * 1000, // Convert seconds to milliseconds
		};
	} catch (error) {
		console.error("Rate limiting error:", error);
		// Fallback to allow request if rate limiting service is down
		return {
			success: true,
			limit: 100,
			remaining: 100,
			reset: Date.now() + 60000,
		};
	}
}

/**
 * Extract session token from cookie header
 */
function extractSessionToken(cookieHeader: string): string | null {
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
