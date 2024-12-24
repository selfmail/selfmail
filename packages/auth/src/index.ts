import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
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
	appName: "selfmail",
	plugins: [admin(), organization(), username()],
});
