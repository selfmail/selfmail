import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia, TimeSpan } from "lucia";
import { db } from "database";

const adapter = new PrismaAdapter(db.session, db.user);
export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(2, "w"), // 2 weeks
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
});

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
  }
}
