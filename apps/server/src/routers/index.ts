import { publicProcedure, router } from "../lib/trpc.js";
import { authRouter } from "./auth.js";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	auth: authRouter,
});
export type AppRouter = typeof appRouter;
