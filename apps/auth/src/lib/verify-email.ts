import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type { VerifyResult } from "#/lib/verify-email.server";

const schema = z.object({
  token: z.string().min(1),
});

export const verifyEmailTokenFn = createServerFn({
  method: "POST",
})
  .inputValidator(schema)
  .handler(async (ctx) => {
    const { verifyEmailToken } = await import("#/lib/verify-email.server");

    return verifyEmailToken(ctx.data);
  });
