"use server";

import { redirect } from "next/navigation";
import z from "zod";
import { auth } from "@/lib/auth";
import { requireUnauthenticated } from "../auth";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const login = requireUnauthenticated
  .inputSchema(schema)
  .action(async ({ parsedInput }) => {
    const user = await auth.api.signInEmail({
      body: {
        email: parsedInput.email,
        password: parsedInput.password,
        rememberMe: true,
      },
    });

    if (!user.user) throw new Error("Failed to login user.");

    return redirect("/");
  });
