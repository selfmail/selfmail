import { handle } from "hono/vercel";
import { app } from "../src/app.js";
import { posthog } from "../src/lib/posthog.js";

export const runtime = "edge";

export const POST = async () => {
	return handle(app);
};
export const OPTIONS = async () => {
	return handle(app);
};
export const PUT = async () => {
	return handle(app);
};
export const DELETE = async () => {
	return handle(app);
};
export const PATCH = async () => {
	return handle(app);
};
export const HEAD = async () => {
	return handle(app);
};
