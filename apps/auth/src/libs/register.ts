import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { RegisterUtils } from "#/utils/register.server";

export type { RegisterResult } from "#/utils/register.server";

const emailSchema = z
	.email("Invalid email address")
	.transform((email) => email.trim().toLowerCase());

const registerSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Name is required")
		.max(120, "Name is too long"),
	email: emailSchema,
});

export const handleRegisterForm = createServerFn({ method: "POST" })
	.inputValidator(registerSchema)
	.handler((ctx) => RegisterUtils.handleRegister(ctx.data));

export const resendRegisterVerificationFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			email: emailSchema,
		}),
	)
	.handler((ctx) => RegisterUtils.resendVerification(ctx.data));
