import { createMiddleware } from "@rescale/nemo";
import { dashboardMiddleware } from "./app/dashboard/[organization]/_middleware";

export const dynamic = "force-dynamic"

const middlewares = {
	"/dashboard/*organization": dashboardMiddleware,
};

export const middleware = createMiddleware(middlewares);

export const config = {
	matcher: ["/((?!_next/|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};
