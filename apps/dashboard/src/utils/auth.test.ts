import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	host: "dashboard.selfmail.app",
	token: undefined as string | undefined,
	getCurrentUser: vi.fn(),
}));

vi.mock("@selfmail/authentication", () => ({
	Authentication: class {
		getCurrentUser = mocks.getCurrentUser;
	},
}));
vi.mock("@selfmail/logging", () => ({
	createLogger: () => ({ warn: vi.fn(), error: vi.fn() }),
}));
vi.mock("@tanstack/react-router", () => ({
	redirect: (options: unknown) => options,
}));
vi.mock("@tanstack/react-start", () => ({
	createServerOnlyFn: (fn: unknown) => fn,
	createServerFn: () => ({ handler: (fn: unknown) => fn }),
	createMiddleware: () => ({ server: (fn: unknown) => fn }),
}));
vi.mock("@tanstack/react-start/server", () => ({
	getCookie: () => mocks.token,
	getRequestHost: () => mocks.host,
}));

type TestMiddleware = (options: {
	next: ReturnType<typeof vi.fn>;
}) => Promise<unknown>;

beforeEach(() => {
	vi.unstubAllEnvs();
	vi.stubEnv("SELFMAIL_AUTH_URL", "");
	mocks.host = "dashboard.selfmail.app";
	mocks.token = undefined;
	mocks.getCurrentUser.mockReset();
});

it.each([
	["dashboard.selfmail.app", "https://auth.selfmail.app/login"],
	["dashboard.selfmail.app:443", "https://auth.selfmail.app/login"],
	["dashboard.selfmail.localhost", "https://auth.selfmail.localhost/login"],
])("redirects requests on %s to %s", async (host, loginHref) => {
	mocks.host = host;
	const { authMiddleware } = await import("./auth");
	await expect(
		(authMiddleware as unknown as TestMiddleware)({ next: vi.fn() }),
	).rejects.toEqual({ href: loginHref });
});

it("uses the configured auth origin", async () => {
	vi.stubEnv("SELFMAIL_AUTH_URL", "http://localhost:3010");
	const { authMiddleware } = await import("./auth");
	await expect(
		(authMiddleware as unknown as TestMiddleware)({ next: vi.fn() }),
	).rejects.toEqual({ href: "http://localhost:3010/login" });
});

it("checks the current session again after an unauthenticated request", async () => {
	const { authMiddleware } = await import("./auth");
	const middleware = authMiddleware as unknown as TestMiddleware;
	await expect(middleware({ next: vi.fn() })).rejects.toBeDefined();
	mocks.token = "new-session";
	const user = { id: "user-1" };
	mocks.getCurrentUser.mockResolvedValue(user);
	const next = vi.fn().mockResolvedValue("ok");
	await expect(middleware({ next })).resolves.toBe("ok");
	expect(mocks.getCurrentUser).toHaveBeenCalledWith("new-session");
	expect(next).toHaveBeenCalledWith({ context: { user } });
});
