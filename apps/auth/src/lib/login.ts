import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { LoginUtils } from "#/utils/login.server";

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
  .handler((ctx) => LoginUtils.handleLogin(ctx.data));

export const resendLoginEmailFn = createServerFn({
  method: "POST",
})
  .inputValidator(loginSchema)
  .handler((ctx) => LoginUtils.handleLogin(ctx.data));
