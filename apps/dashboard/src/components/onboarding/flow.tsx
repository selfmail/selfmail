import { Alert, AlertDescription, Button, Progress } from "@selfmail/ui";
import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
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
					workspaceName: data.workspaceName,
				},
			});

			if (result.status === "success") {
				reset();
				await navigate({ to: "/" });
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

	const progress = (page / lastPage) * 100;

	return (
		<form
			className="flex w-full max-w-lg flex-col gap-5"
			noValidate
			onSubmit={handleSubmit}
		>
			<Progress
				aria-label={m["onboarding.steps.label"]({
					current: page,
					total: lastPage,
				})}
				className="h-1.5"
				value={progress}
			/>

			<fieldset className="t-page-slide min-h-96 border-0 p-0" data-page={page}>
				<legend className="sr-only">
					{m["onboarding.steps.label"]({
						current: page,
						total: lastPage,
					})}
				</legend>
				<OnboardingPageSlide currentPage={page} page={1}>
					<OnboardingName
						errors={{
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
				<Alert aria-live="polite" variant="destructive">
					<AlertDescription>{submitError}</AlertDescription>
				</Alert>
			) : null}

			<div className="grid grid-cols-2 gap-3 pt-1">
				<Button
					className="cursor-pointer"
					disabled={page === 1 || isSubmitting}
					onClick={() => goBack((page - 1) as OnboardingPage)}
					size="lg"
					type="button"
					variant="outline"
				>
					{m["onboarding.actions.back"]()}
				</Button>
				<Button
					className="cursor-pointer"
					disabled={isSubmitting}
					size="lg"
					type="submit"
				>
					{page === lastPage
						? m["onboarding.actions.create"]()
						: m["onboarding.actions.continue"]()}
				</Button>
			</div>
		</form>
	);
}
