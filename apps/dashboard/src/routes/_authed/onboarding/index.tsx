import { createFileRoute } from "@tanstack/react-router";
import { OnboardingFlow } from "#/components/onboarding/flow";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/_authed/onboarding/")({
	head: () => ({
		meta: [
			{
				title: m["onboarding.meta.title"](),
			},
		],
	}),
	component: () => (
		<main className="relative flex min-h-dvh items-center justify-center bg-background px-5 py-20 text-foreground sm:px-10">
			<a
				className="absolute top-5 left-1/2 -translate-x-1/2 font-medium text-xl"
				href="https://selfmail.app"
			>
				Selfmail
			</a>
			<OnboardingFlow />
		</main>
	),
});
