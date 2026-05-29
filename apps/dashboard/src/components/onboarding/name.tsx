import { Input, Label } from "@selfmail/ui";
import { m } from "#/paraglide/messages";
import { useOnboardingStore } from "#/stores/onboarding";

interface OnboardingNameErrors {
	workspaceName?: string;
}

interface OnboardingNameProps {
	errors?: OnboardingNameErrors;
}

export function OnboardingName({ errors }: OnboardingNameProps) {
	const { data, setField } = useOnboardingStore();

	return (
		<div className="flex flex-col gap-5">
			<h1 className="text-balance font-medium text-3xl">
				{m["onboarding.name.title"]()}
			</h1>

			<div className="grid gap-4">
				<div className="space-y-2">
					<Label htmlFor="workspace-name">
						{m["onboarding.name.workspace.label"]()}
					</Label>
					<Input
						aria-describedby={
							errors?.workspaceName ? "workspace-name-error" : undefined
						}
						aria-invalid={Boolean(errors?.workspaceName)}
						autoComplete="organization"
						id="workspace-name"
						onChange={(event) => setField("workspaceName", event.target.value)}
						placeholder={m["onboarding.name.workspace.placeholder"]()}
						value={data.workspaceName}
					/>
					{errors?.workspaceName ? (
						<p
							className="text-destructive text-pretty text-sm"
							id="workspace-name-error"
						>
							{errors.workspaceName}
						</p>
					) : null}
				</div>
			</div>
		</div>
	);
}
