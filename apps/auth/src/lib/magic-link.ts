import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type { VerifyMagicLinkResult } from "#/lib/magic-link.server";

const schema = z.object({
	token: z.string().min(32).max(64),
});

export const verifyMagicLinkToken = createServerFn({
	method: "POST",
})
	.inputValidator(schema)
	.handler(async (ctx) => {
		const { verifyMagicLink } = await import("#/lib/magic-link.server");

		return verifyMagicLink(ctx.data);
	});
