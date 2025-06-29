import type { Context as HonoContext } from "hono";
import type { PublicUser } from "../db";
import { extractSessionToken } from "./auth";
import { validateSession } from "./auth-service";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	// Extract session token from cookies
	const cookieHeader = context.req.header("cookie");
	const sessionToken = extractSessionToken(cookieHeader);

	let user: PublicUser | null = null;

	if (sessionToken) {
		const sessionData = await validateSession(sessionToken);
		if (sessionData) {
			user = sessionData.user;
		}
	}

	return {
		user,
		sessionToken,
		honoContext: context, // Pass the Hono context for setting cookies
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
