import { auth } from "auth";
import { createMiddleware, createSafeActionClient } from "next-safe-action";
import { headers } from "next/headers";
import { z } from "zod";

export const authMiddleware = createMiddleware<{
	metadata: { actionName: string };
}>().define(async ({ next }) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Unauthorized");
	}

	return next({
		ctx: {
			sessionId: session.session.id,
			userId: session.user.id,
		},
	});
});

export const authActionClient = createSafeActionClient({
	defineMetadataSchema: () => {
		return z.object({
			actionName: z.string(),
		});
	},
	handleServerError: (e) => {
		console.error("Action error:", e.message);
		return {
			errorMessage: e.message,
		};
	},
}).use(authMiddleware);
