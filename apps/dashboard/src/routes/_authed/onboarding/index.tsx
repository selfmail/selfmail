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
		<main className="flex min-h-dvh flex-col bg-background px-5 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-foreground sm:px-10">
			<a
				className="mx-auto w-full max-w-lg font-medium text-xl"
				href="https://selfmail.app"
			>
				Selfmail
			</a>
			<div className="flex flex-1 items-center justify-center py-10">
				<OnboardingFlow />
			</div>
		</main>
	),
});
