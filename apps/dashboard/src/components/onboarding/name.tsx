import { Input, Label } from "#/components/ui";
import { m } from "#/paraglide/messages";
import { useOnboardingStore } from "#/stores/onboarding";

interface OnboardingNameErrors {
	workspaceHandle?: string;
	workspaceName?: string;
}

interface OnboardingNameProps {
	errors?: OnboardingNameErrors;
}

const toWorkspaceHandle = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

export function OnboardingName({ errors }: OnboardingNameProps) {
	const { data, setField } = useOnboardingStore();

	const handleNameChange = (value: string) => {
		const currentGeneratedHandle = toWorkspaceHandle(data.workspaceName);

		setField("workspaceName", value);

		if (
			!data.workspaceHandle ||
			data.workspaceHandle === currentGeneratedHandle
		) {
			setField("workspaceHandle", toWorkspaceHandle(value));
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-balance text-center font-medium text-3xl">
				{m["onboarding.name.title"]()}
			</h1>

			<div className="grid gap-5">
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
						onChange={(event) => handleNameChange(event.target.value)}
						placeholder={m["onboarding.name.workspace.placeholder"]()}
						value={data.workspaceName}
					/>
					{errors?.workspaceName ? (
						<p className="text-destructive text-sm" id="workspace-name-error">
							{errors.workspaceName}
						</p>
					) : null}
				</div>

				<div className="space-y-2">
					<Label htmlFor="workspace-handle">
						{m["onboarding.name.handle.label"]()}
					</Label>
					<Input
						aria-describedby={
							errors?.workspaceHandle
								? "workspace-handle-error"
								: "workspace-handle-help"
						}
						aria-invalid={Boolean(errors?.workspaceHandle)}
						id="workspace-handle"
						onChange={(event) =>
							setField("workspaceHandle", toWorkspaceHandle(event.target.value))
						}
						placeholder={m["onboarding.name.handle.placeholder"]()}
						value={data.workspaceHandle}
					/>
					{errors?.workspaceHandle ? (
						<p className="text-destructive text-sm" id="workspace-handle-error">
							{errors.workspaceHandle}
						</p>
					) : (
						<p
							className="text-muted-foreground text-sm"
							id="workspace-handle-help"
						>
							{m["onboarding.name.handle.help"]()}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
