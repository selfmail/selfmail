import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, organization } from "better-auth/plugins";
import { db } from "database";

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),
    advanced: {
        cookiePrefix: "selfmail",
        useSecureCookies: true
    },
    emailAndPassword: {
        enabled: true,
    },
    appName: "selfmail",
    plugins: [
        admin(),
        organization(),
    ]
});