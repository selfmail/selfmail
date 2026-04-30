export type OnboardingPage = 1 | 2 | 3 | 4;

export type OnboardingErrors = {
	customDomain?: string;
	defaultAddress?: string;
	memberEmails?: Record<string, string>;
	workspaceHandle?: string;
	workspaceName?: string;
};
