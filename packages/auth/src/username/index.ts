import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/plugins";

export const usernamePlugin = () =>
	({
		id: "usernamePlugin",
		schema: {
			user: {
				fields: {
					username: {
						type: "string",
						required: true,
						unique: true,
					},
				},
			},
		},
		hooks: {
			before: [
				{
					matcher: (context) => context.path.startsWith("/sign-up/email"),
					handler: createAuthMiddleware(async (ctx) => {}),
				},
			],
		},
	}) satisfies BetterAuthPlugin;
