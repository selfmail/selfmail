import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type RegisterResult =
  | {
      status: "error";
      error: {
        code: "EMAIL_TAKEN" | "RATE_LIMITED" | "UNKNOWN_ERROR";
        message: string;
        requestId: string;
      };
    }
  | {
      status: "success";
      email: string;
    };

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  email: z
    .email("Invalid email address")
    .transform((email) => email.trim().toLowerCase()),
});

export const handleRegisterForm = createServerFn({ method: "POST" })
  .inputValidator(registerSchema)
  .handler(async (ctx) => {
    const { handleRegister } = await import("#/lib/register.server");

    return handleRegister(ctx.data);
  });

export const resendRegisterVerificationFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z
        .email("Invalid email address")
        .transform((email) => email.trim().toLowerCase()),
    })
  )
  .handler(async (ctx) => {
    const { resendRegisterVerification } = await import(
      "#/lib/register.server"
    );

    return resendRegisterVerification(ctx.data);
  });
