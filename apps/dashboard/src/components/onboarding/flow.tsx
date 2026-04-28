import { useState } from "react";
import { Button } from "#/components/ui";
import { m } from "#/paraglide/messages";
import { useOnboardingStore } from "#/stores/onboarding";
import { OnboardingAddress } from "./address";
import { OnboardingDomain } from "./domain";
import { OnboardingMembers } from "./members";
import { OnboardingName } from "./name";
import { OnboardingPageSlide } from "./transition";
import type { OnboardingErrors, OnboardingPage } from "./types";
import { hasOnboardingErrors, validateOnboardingPage } from "./validation";

const lastPage = 4;

export function OnboardingFlow() {
	const data = useOnboardingStore((state) => state.data);
	const [page, setPage] = useState<OnboardingPage>(1);
	const [errors, setErrors] = useState<OnboardingErrors>({});

	const goToPage = (nextPage: OnboardingPage) => {
		const pageErrors = validateOnboardingPage(page, data);

		if (hasOnboardingErrors(pageErrors)) {
			setErrors(pageErrors);
			return;
		}

		setErrors({});
		setPage(nextPage);
	};

	return (
		<div className="flex w-full max-w-md flex-col gap-6">
			<fieldset className="t-page-slide min-h-80 border-0 p-0" data-page={page}>
				<legend className="sr-only">
					{m.onboarding_steps_label({
						current: page,
						total: lastPage,
					})}
				</legend>
				<OnboardingPageSlide currentPage={page} page={1}>
					<OnboardingName
						errors={{
							workspaceHandle: errors.workspaceHandle,
							workspaceName: errors.workspaceName,
						}}
					/>
				</OnboardingPageSlide>
				<OnboardingPageSlide currentPage={page} page={2}>
					<OnboardingDomain error={errors.customDomain} />
				</OnboardingPageSlide>
				<OnboardingPageSlide currentPage={page} page={3}>
					<OnboardingAddress error={errors.defaultAddress} />
				</OnboardingPageSlide>
				<OnboardingPageSlide currentPage={page} page={4}>
					<OnboardingMembers memberErrors={errors.memberEmails} />
				</OnboardingPageSlide>
			</fieldset>

			<div className="grid grid-cols-2 gap-3">
				<Button
					disabled={page === 1}
					onClick={() => goToPage((page - 1) as OnboardingPage)}
					type="button"
					variant="outline"
				>
					{m.onboarding_back()}
				</Button>
				<Button
					onClick={() => {
						if (page < lastPage) {
							goToPage((page + 1) as OnboardingPage);
						}
					}}
					type="button"
				>
					{page === lastPage ? m.onboarding_create() : m.onboarding_continue()}
				</Button>
			</div>
		</div>
	);
}
