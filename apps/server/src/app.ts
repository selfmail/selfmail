import "dotenv/config";

import { trpcServer } from "@hono/trpc-server";
import { type UnkeyContext, unkey } from "@unkey/hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createContext } from "./lib/context.js";
import { env } from "./lib/env.js";
import { appRouter } from "./routers/index.js";
import { handler } from "./utils/handler.js";

export const app = new Hono<{ Variables: { unkey: UnkeyContext } }>();

if (env.UNKEY_API_ID) {
	// Only apply Unkey middleware if API ID is configured
	app.use(
		"/v1/*",
		unkey({
			apiId: env.UNKEY_API_ID,
			onError: (c, _) => {
				return c.json(
					{
						error: "Unauthorized",
					},
					401,
				);
			},
		}),
	);
}

app.use(logger());
app.use(
	"/*",
	cors({
		origin: (origin, c) => {
			if (env.NODE_ENV === "development") {
				// Allow localhost in development without CORS origin
				return "http://localhost:3001";
			}
			if (origin.endsWith(".selfmail.app")) {
				// Allow all subdomains of selfmail.app in production
				return origin;
			}

			// for other options we use the env variable CORS_ORIGIN
			if (!env.CORS_ORIGIN) {
				// If no CORS_ORIGIN is set, allow all origins
				return "*";
			}

			// If CORS_ORIGIN is set, split by comma and return the first match
			if (env.CORS_ORIGIN.includes(",")) {
				const origins = env.CORS_ORIGIN.split(",");
				if (origins.includes(origin)) {
					return origin;
				}
				return "*"; // If the origin is not in the list, return *
			}
		},
		allowMethods: ["GET", "POST", "OPTIONS"],
		credentials: true, // Allow cookies to be sent
		allowHeaders: ["Content-Type", "Authorization"],
	}),
);

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

// Add a simple test route
app.get("/", (c) => {
	return c.json({
		message: "API is working!",
		timestamp: new Date().toISOString(),
	});
});

// Initialize routes
async function initializeRoutes() {
	await handler();
}

// Initialize routes immediately
initializeRoutes().catch(console.error);
