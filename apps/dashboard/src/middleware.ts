import { createMiddleware } from "@rescale/nemo";
import { dashboardMiddleware } from "./app/dashboard/[organization]/middleware";

const middlewares = {
	"/dashboard{/*team}": dashboardMiddleware,
};

export const middleware = createMiddleware(middlewares);

export const config = {
	matcher: ["/((?!_next/|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};
