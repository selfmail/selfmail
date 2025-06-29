import { handle } from "hono/vercel";
import { app } from "../src/app";

export const runtime = "nodejs";

// Add a simple test route
app.get("/", (c) => {
	return c.json({
		message: "API is working!",
		timestamp: new Date().toISOString(),
	});
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const HEAD = handle(app);
export const OPTIONS = handle(app);
