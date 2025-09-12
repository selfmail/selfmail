import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "database"; // your drizzle instance
export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql"
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        modelName: "AdminUser",
    },
    session: {
        modelName: "AdminSession",
    },
    verification: {
        modelName: "AdminVerification",
    },
    account: {
        modelName: "AdminAccount",
    }
});
