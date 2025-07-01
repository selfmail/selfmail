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
		origin:
			env.NODE_ENV === "development"
				? "http://localhost:3000"
				: env.CORS_ORIGIN?.includes(",")
					? env.CORS_ORIGIN.split(",")
					: env.CORS_ORIGIN || "*",
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

app.post("/v1/wow", (c) => {
	return c.text("OK");
});

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
