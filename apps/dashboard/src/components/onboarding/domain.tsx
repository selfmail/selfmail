import { Card, CardContent, Input, Label, Switch } from "@selfmail/ui";
import { m } from "#/paraglide/messages";
import { useOnboardingStore } from "#/stores/onboarding";

interface OnboardingDomainProps {
	error?: string;
}

export function OnboardingDomain({ error }: OnboardingDomainProps) {
	const { data, setCustomDomainEnabled, setField } = useOnboardingStore();
	const fallbackDomain = `${data.workspaceHandle || "workspace"}.selfmail.app`;
	const activeDomain = data.useCustomDomain
		? data.customDomain || "yourdomain.com"
		: fallbackDomain;

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-balance text-center font-medium text-3xl">
				{m["onboarding.domain.title"]()}
			</h1>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between gap-5">
						<div className="space-y-1">
							<Label htmlFor="custom-domain">
								{m["onboarding.domain.custom.label"]()}
							</Label>
							<p className="text-muted-foreground text-sm">
								{m["onboarding.domain.custom.help"]()}
							</p>
						</div>
						<Switch
							checked={data.useCustomDomain}
							id="custom-domain"
							onCheckedChange={setCustomDomainEnabled}
						/>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-5">
				<div className="space-y-2">
					<Label htmlFor="domain-name">
						{m["onboarding.domain.field.label"]()}
					</Label>
					<Input
						aria-describedby={error ? "domain-name-error" : "domain-name-help"}
						aria-invalid={Boolean(error)}
						disabled={!data.useCustomDomain}
						id="domain-name"
						inputMode="url"
						onChange={(event) => setField("customDomain", event.target.value)}
						placeholder={m["onboarding.domain.field.placeholder"]()}
						value={data.customDomain}
					/>
					{error ? (
						<p className="text-destructive text-sm" id="domain-name-error">
							{error}
						</p>
					) : (
						<p className="text-muted-foreground text-sm" id="domain-name-help">
							{m["onboarding.domain.current"]()}{" "}
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
