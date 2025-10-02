import { type RequestHandler, z } from "@builder.io/qwik-city";
import { db } from "database";

export const onGet: RequestHandler = async ({ query, redirect }) => {
	const queryParse = await z
		.object({
			token: z
				.string()
				.min(32, "Token is required")
				.max(33, "Token is invalid"),
		})
		.safeParseAsync(Object.fromEntries(query.entries()));

	if (!queryParse.success) {
		throw redirect(
			302,
			"/auth/login?error=Invalid%20or%20expired%20verification%20link",
		);
	}

	const token = await db.emailVerification.findUnique({
		where: {
			token: queryParse.data.token,
		},
	});

	if (!token || token.expiresAt < new Date()) {
		throw redirect(
			300,
			"/auth/login?error=Invalid%20or%20expired%20verification%20link",
		);
	}

	await db.user.update({
		where: {
			id: token.userId,
		},
		data: {
			emailVerified: new Date(),
		},
	});

	await db.emailVerification.deleteMany({
		where: {
			userId: token.userId,
		},
	});

	throw redirect(
		302,
		"/auth/login?success=Your%20email%20has%20been%20verified%20successfully",
	);
};
