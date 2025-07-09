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
		origin: (origin) => {
			if (env.NODE_ENV === "development") {
				// Allow all origins in development
				return origin ?? "*";
			}

			// Allow all subdomains of selfmail.app in production
			if (origin?.endsWith(".selfmail.app")) {
				return origin;
			}

			// Check environment variable for allowed origins
			if (env.CORS_ORIGIN) {
				if (env.CORS_ORIGIN.includes(",")) {
					// Handle multiple origins
					const origins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
					return origins.includes(origin ?? "") ? origin : null;
				}
				// Handle single origin
				return env.CORS_ORIGIN === origin ? origin : null;
			}

			// If no CORS_ORIGIN is set, allow all origins
			return origin ?? "*";
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
	console.log();
	await handler();
}

// Initialize routes immediately
initializeRoutes().catch(console.error);
