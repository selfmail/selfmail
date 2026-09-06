import { Badge, Button } from "@selfmail/ui";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon, KeyRoundIcon, MailIcon } from "lucide-react";
import { getAuthenticationSettings } from "#/lib/settings/authentication";
import { m } from "#/paraglide/messages";
import type { SettingsPageContext } from "../menu/pages";
import { SettingsPage } from "../ui";
import { ChangeEmailDialog } from "./change-email-dialog";
import { SessionList } from "./session-list";
import { SessionsDialog } from "./sessions-dialog";

const providerLabels = {
	EMAIL: m["dashboard.settings.authentication.provider_email"],
	GOOGLE: m["dashboard.settings.authentication.provider_google"],
} as const;

export function AuthenticationSettingsPage({
	description,
}: SettingsPageContext) {
	const authenticationQuery = useQuery({
		queryFn: () => getAuthenticationSettings(),
		queryKey: ["authentication-settings"],
	});
	const settings = authenticationQuery.data;
	const pageDescription =
		description?.() ??
		m["dashboard.settings.menu.authentication.description"]();

	return (
		<SettingsPage
			description={pageDescription}
			error={[authenticationQuery.error]}
			loading={[authenticationQuery.isLoading]}
			onRetry={() => authenticationQuery.refetch()}
			retryLabel={m["dashboard.settings.retry"]()}
		>
			<div className="min-h-0 overflow-y-auto px-2 pb-4 sm:px-3">
				<p className="mb-6 text-pretty text-muted-foreground text-sm">
					{pageDescription}
				</p>
				{settings ? (
					<div className="grid gap-6">
						<section className="grid gap-3">
							<h3 className="text-balance font-medium text-sm">
								{m["dashboard.settings.authentication.email"]()}
							</h3>
							<div className="flex flex-col items-start gap-4 rounded-xl bg-muted/50 p-4 sm:flex-row sm:items-center">
								<div className="flex min-w-0 flex-1 items-center gap-3">
									<div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
										<MailIcon
											aria-hidden="true"
											className="size-5 text-muted-foreground"
										/>
									</div>
									<div className="grid min-w-0 gap-1.5">
										<p className="break-all text-pretty font-medium text-sm">
											{settings.email}
										</p>
										<span className="flex items-center gap-1 text-muted-foreground text-xs">
											{settings.emailVerified ? (
												<CheckIcon aria-hidden="true" className="size-3.5" />
											) : null}
											{settings.emailVerified
												? m["dashboard.settings.authentication.verified"]()
												: m["dashboard.settings.authentication.unverified"]()}
										</span>
									</div>
								</div>
								<ChangeEmailDialog currentEmail={settings.email}>
									<Button
										className="rounded-lg border"
										size="sm"
										type="button"
										variant="outline"
									>
										{m["dashboard.settings.authentication.change_email"]()}
									</Button>
								</ChangeEmailDialog>
							</div>
						</section>
						<section className="grid gap-3">
							<div className="grid gap-1">
								<h3 className="text-balance font-medium text-sm">
									{m["dashboard.settings.authentication.sign_in_methods"]()}
								</h3>
								<p className="text-pretty text-muted-foreground text-xs">
									{m[
										"dashboard.settings.authentication.sign_in_methods_description"
									]()}
								</p>
							</div>
							<ul className="flex list-none flex-wrap gap-2">
								{settings.providers.map((provider) => (
									<li
										className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
										key={provider}
									>
										{provider === "EMAIL" ? (
											<MailIcon
												aria-hidden="true"
												className="size-4 text-muted-foreground"
											/>
										) : (
											<KeyRoundIcon
												aria-hidden="true"
												className="size-4 text-muted-foreground"
											/>
										)}
										{providerLabels[provider]()}
									</li>
								))}
							</ul>
						</section>
						<section className="border-border border-t pt-5">
							<div className="mb-2 flex flex-wrap items-center justify-between gap-3">
								<div className="grid gap-1.5">
									<h3 className="flex items-center gap-2 text-balance font-medium text-sm">
										{m["dashboard.settings.authentication.sessions"]()}
										<Badge className="px-2 tabular-nums" variant="secondary">
											{settings.activeSessionCount}
										</Badge>
									</h3>
									<p className="text-pretty text-muted-foreground text-xs">
										{m[
											"dashboard.settings.authentication.sessions_description"
										]({ count: settings.activeSessionCount })}
									</p>
								</div>
								<SessionsDialog sessionCount={settings.activeSessionCount} />
							</div>
							<SessionList sessions={settings.sessions} />
						</section>
					</div>
				) : null}
			</div>
		</SettingsPage>
	);
}
