import {
	Input,
	Label,
	SettingsBlock,
	SettingsGroup,
	Switch,
} from "@selfmail/ui";
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
		<div className="flex flex-col gap-5">
			<h1 className="text-balance font-medium text-3xl">
				{m["onboarding.domain.title"]()}
			</h1>

			<SettingsGroup>
				<SettingsBlock
					control={
						<Switch
							checked={data.useCustomDomain}
							id="custom-domain"
							onCheckedChange={setCustomDomainEnabled}
						/>
					}
					description={m["onboarding.domain.custom.help"]()}
					title={
						<Label htmlFor="custom-domain">
							{m["onboarding.domain.custom.label"]()}
						</Label>
					}
				/>
			</SettingsGroup>

			<div className="grid gap-4">
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
						<p
							className="text-destructive text-pretty text-sm"
							id="domain-name-error"
						>
							{error}
						</p>
					) : (
						<p
							className="text-muted-foreground text-pretty text-sm"
							id="domain-name-help"
						>
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
