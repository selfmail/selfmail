import { PostHogProvider as BasePostHogProvider } from "@posthog/react";
import type { ReactNode } from "react";

interface PostHogProviderProps {
	children: ReactNode;
}

export default function PostHogProvider({ children }: PostHogProviderProps) {
	const apiKey = import.meta.env.VITE_POSTHOG_KEY;

	if (!apiKey) {
		return children;
	}

	return (
		<BasePostHogProvider
			apiKey={apiKey}
			options={{
				api_host:
					import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
				capture_pageview: false,
				defaults: "2025-11-30",
				person_profiles: "identified_only",
			}}
		>
			{children}
		</BasePostHogProvider>
	);
}
