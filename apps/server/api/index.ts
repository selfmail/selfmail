import { handle } from "hono/vercel";
import { app } from "../src/app.js";
import { posthog } from "../src/lib/posthog.js";

export const runtime = "edge";

export const POST = async () => {
	handle(app);

	if (posthog) {
		try {
			await posthog.shutdown();
		} catch (error) {
			console.error("Error shutting down PostHog:", error);
		}
	}
};
export const OPTIONS = async () => {
	handle(app);

	if (posthog) {
		try {
			await posthog.shutdown();
		} catch (error) {
			console.error("Error shutting down PostHog:", error);
		}
	}
};
export const PUT = async () => {
	handle(app);

	if (posthog) {
		try {
			await posthog.shutdown();
		} catch (error) {
			console.error("Error shutting down PostHog:", error);
		}
	}
};
export const DELETE = async () => {
	handle(app);

	if (posthog) {
		try {
			await posthog.shutdown();
		} catch (error) {
			console.error("Error shutting down PostHog:", error);
		}
	}
};
export const PATCH = async () => {
	handle(app);

	if (posthog) {
		try {
			await posthog.shutdown();
		} catch (error) {
			console.error("Error shutting down PostHog:", error);
		}
	}
};
export const HEAD = async () => {
	handle(app);

	if (posthog) {
		try {
			await posthog.shutdown();
		} catch (error) {
			console.error("Error shutting down PostHog:", error);
		}
	}
};
