import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type LoginResult =
  | {
      status: "error";
      error: {
        code: "RATE_LIMITED" | "ACCOUNT_NOT_FOUND" | "UNKNOWN_ERROR";
        message: string;
        requestId: string;
      };
    }
  | {
      status: "success";
    };

const loginSchema = z.object({
  email: z
    .email("Invalid email address")
    .transform((email) => email.trim().toLowerCase()),
});

export const handleLoginForm = createServerFn({
  method: "POST",
})
  .inputValidator(loginSchema)
  .handler(async (ctx) => {
    const { handleLogin } = await import("#/lib/login.server");

    return handleLogin(ctx.data);
  });

export const resendLoginEmailFn = createServerFn({
  method: "POST",
})
  .inputValidator(loginSchema)
  .handler(async (ctx) => {
    const { handleLogin } = await import("#/lib/login.server");

    return handleLogin(ctx.data);
  });
