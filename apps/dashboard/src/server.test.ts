import { expect, it, vi } from "vitest";

const { fetch } = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock("@tanstack/react-start/server-entry", () => ({ default: { fetch } }));
vi.mock("./lib/rate-limit", () => ({
	dashboardRateLimitMiddleware: (
		_req: Request,
		next: () => Promise<Response>,
	) => next(),
}));
vi.mock("./paraglide/server.js", () => ({
	paraglideMiddleware: (_req: Request, next: () => Promise<Response>) => next(),
}));

it.each([
	200, 302, 429,
])("prevents caching dashboard responses with status %s", async (status) => {
	fetch.mockResolvedValue(
		new Response(null, {
			status,
			headers: {
				"Cache-Control": "public, max-age=3600",
				Location: "https://auth.selfmail.app/login",
			},
		}),
	);
	const { default: server } = await import("./server");
	const response = await server.fetch(
		new Request("https://dashboard.selfmail.app/"),
	);
	expect(response.headers.get("Cache-Control")).toBe("private, no-store");
	expect(response.status).toBe(status);
	expect(response.headers.get("Location")).toBe(
		"https://auth.selfmail.app/login",
	);
});
