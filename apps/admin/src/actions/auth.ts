import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { client } from "./client";

export const requireAuth = client.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return next({
    ctx: {
      user: session.user,
    },
  });
});

export const requireUnauthenticated = client.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    throw new Error("Already authenticated");
  }

  return next();
});
