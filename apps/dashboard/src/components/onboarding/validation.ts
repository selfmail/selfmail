import { m } from "#/paraglide/messages";
import type { OnboardingData } from "#/stores/onboarding";
import type { OnboardingErrors, OnboardingPage } from "./types";

const domainPattern = /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const handlePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const localPartPattern = /^[a-z0-9]+(?:[._-]?[a-z0-9]+)*$/;

export const hasOnboardingErrors = (errors: OnboardingErrors) =>
	Boolean(
		errors.customDomain ||
			errors.defaultAddress ||
			errors.workspaceHandle ||
			errors.workspaceName ||
			Object.keys(errors.memberEmails ?? {}).length > 0,
	);

export const validateOnboardingPage = (
	page: OnboardingPage,
	data: OnboardingData,
): OnboardingErrors => {
	switch (page) {
		case 1:
			return {
				workspaceName: data.workspaceName.trim()
					? undefined
					: m["onboarding.errors.workspace_name"](),
				workspaceHandle: handlePattern.test(data.workspaceHandle)
					? undefined
					: m["onboarding.errors.workspace_handle"](),
			};
		case 2:
			return data.useCustomDomain
				? {
						customDomain: domainPattern.test(data.customDomain.trim())
							? undefined
							: m["onboarding.errors.domain"](),
					}
				: {};
		case 3:
			return {
				defaultAddress: localPartPattern.test(data.defaultAddress)
					? undefined
					: m["onboarding.errors.address"](),
			};
		case 4:
			return { memberEmails: validateMemberEmails(data) };
		default:
			return {};
	}
};

const validateMemberEmails = (data: OnboardingData) => {
	const errors: Record<string, string> = {};

	for (const memberInvite of data.memberInvites) {
		if (memberInvite.email.trim() && !emailPattern.test(memberInvite.email)) {
			errors[memberInvite.id] = m["onboarding.errors.member_email"]();
		}
	}

	return errors;
};
