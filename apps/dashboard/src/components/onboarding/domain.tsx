import { Input, Label, Switch } from "#/components/ui";
import { m } from "#/paraglide/messages";
import { useOnboardingStore } from "#/stores/onboarding";

interface OnboardingDomainProps {
	error?: string;
}

export function OnboardingDomain({ error }: OnboardingDomainProps) {
	const { data, setCustomDomainEnabled, setField } = useOnboardingStore();
	const fallbackDomain = `${data.workspaceHandle || "workspace"}.selfmail.app`;
	const activeDomain = data.useCustomDomain
		? data.customDomain || "mail.yourdomain.com"
		: fallbackDomain;

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-balance text-center font-medium text-3xl">
				{m.onboarding_domain_title()}
			</h1>

			<div className="rounded-3xl border border-border bg-card p-4">
				<div className="flex items-center justify-between gap-5">
					<div className="space-y-1">
						<Label htmlFor="custom-domain">
							{m.onboarding_custom_domain_label()}
						</Label>
						<p className="text-muted-foreground text-sm">
							{m.onboarding_custom_domain_help()}
						</p>
					</div>
					<Switch
						checked={data.useCustomDomain}
						id="custom-domain"
						onCheckedChange={setCustomDomainEnabled}
					/>
				</div>
			</div>

			<div className="grid gap-5">
				<div className="space-y-2">
					<Label htmlFor="domain-name">{m.onboarding_domain_label()}</Label>
					<Input
						aria-describedby={error ? "domain-name-error" : "domain-name-help"}
						aria-invalid={Boolean(error)}
						disabled={!data.useCustomDomain}
						id="domain-name"
						inputMode="url"
						onChange={(event) => setField("customDomain", event.target.value)}
						placeholder={m.onboarding_domain_placeholder()}
						value={data.customDomain}
					/>
					{error ? (
						<p className="text-destructive text-sm" id="domain-name-error">
							{error}
						</p>
					) : (
						<p className="text-muted-foreground text-sm" id="domain-name-help">
							{m.onboarding_current_domain()}{" "}
							<span className="font-medium text-foreground">
								{activeDomain}
							</span>
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
