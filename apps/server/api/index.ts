import { handle } from "hono/vercel";
import { app } from "../src/app.js";
import { posthog } from "../src/lib/posthog.js";

export const runtime = "edge";

export const POST = handle(app);
export const OPTIONS = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const HEAD = handle(app);
