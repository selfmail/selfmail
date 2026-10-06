import handler from "@tanstack/react-start/server-entry";
import { dashboardRateLimitMiddleware } from "./lib/rate-limit";
import { paraglideMiddleware } from "./paraglide/server.js";

export default {
	async fetch(req: Request): Promise<Response> {
		const response = await dashboardRateLimitMiddleware(req, () =>
			paraglideMiddleware(req, () => handler.fetch(req)),
		);
		// HTML, redirects, and server functions depend on the current session cookie.
		const headers = new Headers(response.headers);
		headers.set("Cache-Control", "private, no-store");
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		});
	},
};
