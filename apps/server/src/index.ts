import "dotenv/config";

import { trpcServer } from "@hono/trpc-server";
import { type UnkeyContext, unkey } from "@unkey/hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import { handler } from "./utils/handler";

export const app = new Hono<{ Variables: { unkey: UnkeyContext } }>();

app.use(
	"/v1/*",
	unkey({
		apiId: process.env.UNKEY_API_ID ?? "",
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

app.use(logger());

app.use(
	"/*",
	cors({
		origin: process.env.CORS_ORIGIN || "http://localhost:3001",
		allowMethods: ["GET", "POST", "OPTIONS"],
		credentials: true, // Allow cookies to be sent
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

// Handling all routes in `/src/routes` directory
await handler();

export default {
	port: process.env.PORT ? Number.parseInt(process.env.PORT) : 3000,
	fetch: app.fetch,
};
