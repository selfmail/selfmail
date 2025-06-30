import { handle } from "hono/vercel";
import { app } from "../src/app.js";
import { posthog } from "../src/lib/posthog.js";

export const runtime = "edge";

export const POST = async () => {
	handle(app);
};
export const OPTIONS = async () => {
	handle(app);
};
export const PUT = async () => {
	handle(app);
};
export const DELETE = async () => {
	handle(app);
};
export const PATCH = async () => {
	handle(app);
};
export const HEAD = async () => {
	handle(app);
};
