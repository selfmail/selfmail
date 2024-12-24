import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, organization, username } from "better-auth/plugins";
import { db } from "database";

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: "postgresql",
	}),
	advanced: {
		cookiePrefix: "selfmail",
		useSecureCookies: true,
	},
	emailAndPassword: {
		enabled: true,
		maxPasswordLength: 100,
		minPasswordLength: 8,
	},
	appName: "selfmail",
	plugins: [admin(), organization(), username(), nextCookies()],
});
