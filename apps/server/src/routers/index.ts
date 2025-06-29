import { z } from "zod";
import { publicProcedure, router } from "../lib/trpc";
import { authRouter } from "./auth";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	hello: publicProcedure.input(z.string()).query(({ input }) => {
		return `Hello ${input}`;
	}),
	auth: authRouter,
});
export type AppRouter = typeof appRouter;
