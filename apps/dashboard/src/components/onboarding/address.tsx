import { Input, Label } from "@selfmail/ui";
import { m } from "#/paraglide/messages";
import { useOnboardingStore } from "#/stores/onboarding";

interface OnboardingAddressProps {
	error?: string;
}

const toAddressLocalPart = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9._-]+/g, "")
		.replace(/^[._-]+|[._-]+$/g, "");

export function OnboardingAddress({ error }: OnboardingAddressProps) {
	const { data, setField } = useOnboardingStore();
	const domain = data.useCustomDomain
		? data.customDomain || "mail.yourdomain.com"
		: `${data.workspaceHandle || "workspace"}.selfmail.app`;
	const address = `${data.defaultAddress || "hello"}@${domain}`;

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-balance text-center font-medium text-3xl">
				{m["onboarding.address.title"]()}
			</h1>

			<div className="grid gap-5">
				<div className="space-y-2">
					<Label htmlFor="default-address">
						{m["onboarding.address.field.label"]()}
					</Label>
					<div className="flex flex-col gap-2 sm:flex-row">
						<Input
							aria-describedby={
								error ? "default-address-error" : "default-address-help"
							}
							aria-invalid={Boolean(error)}
							className="sm:flex-1"
							id="default-address"
							onChange={(event) =>
								setField(
									"defaultAddress",
									toAddressLocalPart(event.target.value),
								)
							}
							placeholder={m["onboarding.address.field.placeholder"]()}
							value={data.defaultAddress}
						/>
						<div className="flex min-h-12 items-center truncate rounded-full border-2 border-neutral-200 bg-muted px-6 text-muted-foreground text-sm sm:max-w-52">
							@{domain}
						</div>
					</div>
					{error ? (
						<p className="text-destructive text-sm" id="default-address-error">
							{error}
						</p>
					) : (
						<p
							className="text-muted-foreground text-sm"
							id="default-address-help"
						>
							{m["onboarding.address.preview"]()}{" "}
							<span className="font-medium text-foreground">{address}</span>
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
