import type { Context } from "hono";
import type { PublicUser } from "../db";
import { createLogoutCookie, createSessionCookie } from "./auth";

/**
 * Middleware helpers for handling authentication cookies
 */

/**
 * Set session cookie in HTTP response
 */
export function setSessionCookie(c: Context, sessionToken: string): void {
	c.header("Set-Cookie", createSessionCookie(sessionToken));
}

/**
 * Clear session cookie (logout)
 */
export function clearSessionCookie(c: Context): void {
	c.header("Set-Cookie", createLogoutCookie());
}

/**
 * Authentication status type
 */
export type AuthStatus = {
	isAuthenticated: boolean;
	user: PublicUser | null;
};

/**
 * Extract authentication status from context
 */
export function getAuthStatus(user: PublicUser | null): AuthStatus {
	return {
		isAuthenticated: !!user,
		user: user || null,
	};
}
