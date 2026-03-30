import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MagicLinkUtils } from "#/utils/magic-link.server";

export type VerifyMagicLinkResult =
  | {
      status: "error";
      error: {
        message: string;
        requestId: string;
      };
    }
  | {
      status: "success";
    };

const schema = z.object({
  token: z.string().min(32).max(64),
});

export const verifyMagicLinkToken = createServerFn({
  method: "POST",
})
  .inputValidator(schema)
  .handler((ctx) => MagicLinkUtils.verify(ctx.data));
