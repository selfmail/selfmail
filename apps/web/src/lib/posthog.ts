import posthog from "posthog-js";

export const ph = posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY ?? "", {
	api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
	autocapture: true,
	capture_pageview: true,
	loaded: (posthog) => {
		posthog.register({
			version: "1.0.0",
			environment: process.env.NODE_ENV || "development",
		});
	},
	persistence: "localStorage",
});
