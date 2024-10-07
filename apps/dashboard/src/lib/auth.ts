import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "database";

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),
});