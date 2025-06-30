import { PostHog } from "posthog-node";

export const posthog = new PostHog(process.env.PUBLIC_POSTHOG_KEY ?? "", {
	host: process.env.PUBLIC_POSTHOG_HOST,
});
