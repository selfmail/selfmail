import { db } from "database";

export interface AuthUser {
	id: string;
	email: string;
	name: string;
	workspaceId?: string;
	emailVerified?: Date;
}

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
			emailVerified: session.user.emailVerified ?? undefined,
		};
	} catch (error) {
		console.error("Session auth middleware error:", error);
		return null;
	}
}

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
