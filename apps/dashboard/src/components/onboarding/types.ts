export type OnboardingPage = 1 | 2 | 3 | 4;

export interface OnboardingErrors {
	customDomain?: string;
	defaultAddress?: string;
	memberEmails?: Record<string, string>;
	workspaceName?: string;
}
