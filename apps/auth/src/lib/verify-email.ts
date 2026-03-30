import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	type VerifyResult,
	VerifyEmailUtils,
} from "#/utils/verify-email.server";

export type { VerifyResult };

const schema = z.object({
  token: z.string().min(1),
});

export const verifyEmailTokenFn = createServerFn({
  method: "POST",
})
  .inputValidator(schema)
  .handler((ctx) => VerifyEmailUtils.verifyToken(ctx.data));
