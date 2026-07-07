import { RateLimiter } from "@selfmail/web-ratelimit";

type RateLimitOptions = {
	limit: number;
	windowSeconds: number;
};

type RateLimitResult = {
	allowed: boolean;
	limit: number;
	remaining: number;
	resetAt: Date;
	resetIn: number;
};

type RateLimitStore = {
	limit: (
		identifier: string,
		options: RateLimitOptions,
	) => Promise<RateLimitResult>;
};

type DashboardRateLimitOptions = {
	now?: () => number;
	store?: RateLimitStore;
};

type DashboardRateLimitNext = () => Promise<Response>;

const DEFAULT_LIMIT = 300;
const DEFAULT_WINDOW_SECONDS = 60;
const DEFAULT_TIMEOUT_MS = 250;
const STORE_FAILURE_COOLDOWN_MS = 30_000;
const PROJECT = "dashboard";

const publicPaths = new Set([
	"/favicon.ico",
	"/logo192.png",
	"/logo512.png",
	"/manifest.json",
	"/robots.txt",
]);

const publicPrefixes = [
	"/assets/",
	"/_build/",
	"/build/",
	"/@vite/",
	"/node_modules/",
];

let rateLimiter: RateLimitStore | undefined;

const getPositiveInteger = (key: string, fallback: number) => {
	const value = process.env[key];
	const parsed = value ? Number(value) : Number.NaN;

	return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const limit = getPositiveInteger(
	"DASHBOARD_RATE_LIMIT_REQUESTS",
	DEFAULT_LIMIT,
);
const windowSeconds = getPositiveInteger(
	"DASHBOARD_RATE_LIMIT_WINDOW_SECONDS",
	DEFAULT_WINDOW_SECONDS,
);
const timeoutMs = getPositiveInteger(
	"DASHBOARD_RATE_LIMIT_TIMEOUT_MS",
	DEFAULT_TIMEOUT_MS,
);

const getRateLimiter = () => {
	rateLimiter ??= new RateLimiter(PROJECT);
	return rateLimiter;
};

const shouldSkipRateLimit = (request: Request) => {
	if (request.method === "OPTIONS") {
		return true;
	}

	const pathname = new URL(request.url).pathname;

	return (
		publicPaths.has(pathname) ||
		publicPrefixes.some((prefix) => pathname.startsWith(prefix))
	);
};

const firstHeaderValue = (value: string | null) =>
	value?.split(",")[0]?.trim() || undefined;

const forwardedFor = (value: string | null) => {
	const match = value?.match(/(?:^|;)\s*for="?([^";,]+)"?/i);
	return match?.[1]?.trim();
};

const getClientIdentifier = async (request: Request) => {
	const ip =
		firstHeaderValue(request.headers.get("cf-connecting-ip")) ??
		firstHeaderValue(request.headers.get("x-real-ip")) ??
		firstHeaderValue(request.headers.get("x-forwarded-for")) ??
		forwardedFor(request.headers.get("forwarded")) ??
		"anonymous";
	const digest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(ip),
	);

	return Array.from(new Uint8Array(digest), (part) =>
		part.toString(16).padStart(2, "0"),
	).join("");
};

const withTimeout = <T>(promise: Promise<T>, ms: number) =>
	Promise.race([
		promise,
		new Promise<never>((_, reject) => {
			setTimeout(() => reject(new Error("Rate limit check timed out")), ms);
		}),
	]);

const createTooManyRequestsResponse = (result: RateLimitResult) => {
	const retryAfter = Math.max(1, result.resetIn);

	return new Response("Too many requests", {
		status: 429,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Retry-After": retryAfter.toString(),
			"X-RateLimit-Limit": result.limit.toString(),
			"X-RateLimit-Remaining": result.remaining.toString(),
			"X-RateLimit-Reset": Math.ceil(
				result.resetAt.getTime() / 1000,
			).toString(),
		},
	});
};

export const createDashboardRateLimitMiddleware = ({
	now = Date.now,
	store,
}: DashboardRateLimitOptions = {}) => {
	let disabledUntil = 0;

	return async (request: Request, next: DashboardRateLimitNext) => {
		if (shouldSkipRateLimit(request) || now() < disabledUntil) {
			return next();
		}

		try {
			const identifier = await getClientIdentifier(request);
			const result = await withTimeout(
				(store ?? getRateLimiter()).limit(identifier, { limit, windowSeconds }),
				timeoutMs,
			);

			if (!result.allowed) {
				return createTooManyRequestsResponse(result);
			}
		} catch (error) {
			disabledUntil = now() + STORE_FAILURE_COOLDOWN_MS;
			console.warn("Dashboard rate limit check failed", error);
		}

		return next();
	};
};

export const dashboardRateLimitMiddleware =
	createDashboardRateLimitMiddleware();
