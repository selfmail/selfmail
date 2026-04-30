import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { Button } from "#/components/ui";
import { createOnboardingWorkspaceFn } from "#/lib/onboarding";
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
	const addMemberEmail = useOnboardingStore((state) => state.addMemberEmail);
	const reset = useOnboardingStore((state) => state.reset);
	const [page, setPage] = useState<OnboardingPage>(1);
	const [errors, setErrors] = useState<OnboardingErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const navigate = useNavigate();

	const validateCurrentPage = () => {
		const pageErrors = validateOnboardingPage(page, data);

		if (hasOnboardingErrors(pageErrors)) {
			setErrors(pageErrors);
			return false;
		}

		setErrors({});
		return true;
	};

	const goToNextPage = () => {
		if (!validateCurrentPage() || page === lastPage) {
			return;
		}

		setPage((page + 1) as OnboardingPage);
	};

	const addMemberInvite = () => {
		if (validateCurrentPage()) {
			addMemberEmail();
		}
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!validateCurrentPage()) {
			return;
		}

		if (page !== lastPage) {
			goToNextPage();
			return;
		}

		setIsSubmitting(true);
		setSubmitError(null);

		try {
			const result = await createOnboardingWorkspaceFn({
				data: {
					defaultAddress: data.defaultAddress,
					workspaceHandle: data.workspaceHandle,
					workspaceName: data.workspaceName,
				},
			});

			if (result.status === "success") {
				reset();
				await navigate({ to: "/" });
				return;
			}

			if (result.error.code === "WORKSPACE_TAKEN") {
				setPage(1);
				setErrors({ workspaceHandle: result.error.message });
				return;
			}

			if (result.error.code === "ADDRESS_TAKEN") {
				setErrors({ defaultAddress: result.error.message });
				return;
			}

			setSubmitError(result.error.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const goBack = (nextPage: OnboardingPage) => {
		setErrors({});
		setSubmitError(null);
		setPage(nextPage);
	};

	return (
		<form
			className="flex w-full max-w-md flex-col gap-6"
			noValidate
			onSubmit={handleSubmit}
		>
			<fieldset className="t-page-slide min-h-80 border-0 p-0" data-page={page}>
				<legend className="sr-only">
					{m["onboarding.steps.label"]({
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
					<OnboardingMembers
						memberErrors={errors.memberEmails}
						onAddMember={addMemberInvite}
					/>
				</OnboardingPageSlide>
			</fieldset>

			{submitError ? (
				<p
					aria-live="polite"
					className="text-pretty rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm"
					role="alert"
				>
					{submitError}
				</p>
			) : null}

			<div className="grid grid-cols-2 gap-3">
				<Button
					disabled={page === 1 || isSubmitting}
					onClick={() => goBack((page - 1) as OnboardingPage)}
					type="button"
					variant="outline"
				>
					{m["onboarding.actions.back"]()}
				</Button>
				<Button disabled={isSubmitting} type="submit">
					{page === lastPage
						? m["onboarding.actions.create"]()
						: m["onboarding.actions.continue"]()}
				</Button>
			</div>
		</form>
	);
}
