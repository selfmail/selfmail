import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context.js";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "You must be logged in to access this resource.",
		});
	}
	return next({
		ctx: {
			user: ctx.user,
			sessionToken: ctx.sessionToken,
			honoContext: ctx.honoContext,
		},
	});
});
