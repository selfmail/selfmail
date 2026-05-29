import { Button, cn, Input, SettingsBlock, SettingsGroup } from "@selfmail/ui";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { m } from "#/paraglide/messages";
import { useOnboardingStore } from "#/stores/onboarding";

interface OnboardingMembersProps {
	memberErrors?: Record<string, string>;
	onAddMember: () => void;
}

export function OnboardingMembers({
	memberErrors,
	onAddMember,
}: OnboardingMembersProps) {
	const { data, removeMemberEmail, setMemberEmail } = useOnboardingStore();
	const domain = data.useCustomDomain
		? data.customDomain || "mail.yourdomain.com"
		: "workspace.selfmail.app";
	const cleanMembers = data.memberInvites.filter(({ email }) => email.trim());
	const notSet = m["onboarding.review.not_set"]();
	const summaryItems = [
		[m["onboarding.review.workspace"](), data.workspaceName || notSet],
		[
			m["onboarding.review.address"](),
			`${data.defaultAddress || "hello"}@${domain}`,
		],
		[
			m["onboarding.review.members"](),
			cleanMembers.length
				? m["onboarding.members.invited"]({ count: cleanMembers.length })
				: m["onboarding.members.only_you"](),
		],
	] as const;

	return (
		<div className="flex flex-col gap-5">
			<h1 className="text-balance font-medium text-3xl">
				{m["onboarding.members.title"]()}
			</h1>

			<div className="grid gap-5">
				<fieldset className="space-y-3 border-0 p-0">
					<legend className="text-foreground text-sm leading-none">
						{m["onboarding.members.label"]()}
					</legend>
					<div className="space-y-3">
						{data.memberInvites.map((memberInvite, index) => (
							<div className="space-y-2" key={memberInvite.id}>
								<div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
									<Input
										aria-describedby={
											memberErrors?.[memberInvite.id]
												? `${memberInvite.id}-error`
												: undefined
										}
										aria-invalid={Boolean(memberErrors?.[memberInvite.id])}
										aria-label={m["onboarding.members.input_label"]({
											number: index + 1,
										})}
										className="flex-1"
										onChange={(event) =>
											setMemberEmail(memberInvite.id, event.target.value)
										}
										placeholder={m["onboarding.members.placeholder"]()}
										type="email"
										value={memberInvite.email}
									/>
									<Button
										aria-label={m["onboarding.members.remove_invite"]()}
										disabled={
											data.memberInvites.length === 1 && !memberInvite.email
										}
										onClick={() => removeMemberEmail(memberInvite.id)}
										size="icon"
										type="button"
										variant="outline"
									>
										<Trash2Icon className="size-4" />
									</Button>
								</div>
								{memberErrors?.[memberInvite.id] ? (
									<p
										className="text-destructive text-pretty text-sm"
										id={`${memberInvite.id}-error`}
									>
										{memberErrors[memberInvite.id]}
									</p>
								) : null}
							</div>
						))}
					</div>
					<Button onClick={onAddMember} type="button" variant="outline">
						<PlusIcon className="size-4" />
						{m["onboarding.members.add_invite"]()}
					</Button>
				</fieldset>

				<section className="grid gap-2">
					<h2 className="font-medium text-sm">
						{m["onboarding.review.title"]()}
					</h2>
					<SettingsGroup>
						{summaryItems.map(([label, value]) => (
							<SettingsBlock
								className="sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]"
								key={label}
								title={label}
							>
								<div
									className={cn(
										"truncate text-left font-medium text-sm sm:text-right",
										value === notSet && "text-muted-foreground",
									)}
									title={value}
								>
									{value}
								</div>
							</SettingsBlock>
						))}
					</SettingsGroup>
				</section>
			</div>
		</div>
	);
}
