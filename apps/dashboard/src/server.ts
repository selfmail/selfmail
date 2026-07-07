import handler from "@tanstack/react-start/server-entry";
import { dashboardRateLimitMiddleware } from "./lib/rate-limit";
import { paraglideMiddleware } from "./paraglide/server.js";

export default {
	fetch(req: Request): Promise<Response> {
		return dashboardRateLimitMiddleware(req, () =>
			paraglideMiddleware(req, () => handler.fetch(req)),
		);
	},
};
