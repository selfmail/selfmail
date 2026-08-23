import { Badge, Button, SettingsBlock, SettingsGroup } from "@selfmail/ui";
import { useQuery } from "@tanstack/react-query";
import { KeyRoundIcon, MailIcon } from "lucide-react";
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

	return (
		<SettingsPage
			description={description?.()}
			error={[authenticationQuery.error]}
			loading={[authenticationQuery.isLoading]}
			onRetry={() => authenticationQuery.refetch()}
			retryLabel={m["dashboard.settings.retry"]()}
		>
			<p className="text-pretty text-muted-foreground text-sm">
				{description?.()}
			</p>
			{settings ? (
				<SettingsGroup>
					<SettingsBlock
						control={
							<ChangeEmailDialog currentEmail={settings.email}>
								<Button size="sm" type="button" variant="outline">
									{m["dashboard.settings.authentication.change_email"]()}
								</Button>
							</ChangeEmailDialog>
						}
						description={
							<span className="flex flex-wrap items-center gap-2">
								<span className="break-all">{settings.email}</span>
								<Badge variant={settings.emailVerified ? "default" : "outline"}>
									{settings.emailVerified
										? m["dashboard.settings.authentication.verified"]()
										: m["dashboard.settings.authentication.unverified"]()}
								</Badge>
							</span>
						}
						title={m["dashboard.settings.authentication.email"]()}
					/>
					<SettingsBlock
						control={
							<div className="flex flex-wrap items-center justify-end gap-2">
								{settings.providers.map((provider) => (
									<Badge key={provider} variant="secondary">
										{provider === "EMAIL" ? (
											<MailIcon aria-hidden="true" className="size-3" />
										) : (
											<KeyRoundIcon aria-hidden="true" className="size-3" />
										)}
										{providerLabels[provider]()}
									</Badge>
								))}
							</div>
						}
						description={m[
							"dashboard.settings.authentication.sign_in_methods_description"
						]()}
						title={m["dashboard.settings.authentication.sign_in_methods"]()}
					/>
					<SettingsBlock
						control={
							<SessionsDialog sessionCount={settings.activeSessionCount} />
						}
						description={m[
							"dashboard.settings.authentication.sessions_description"
						]({ count: settings.activeSessionCount })}
						title={m["dashboard.settings.authentication.sessions"]()}
					/>
					<SessionList sessions={settings.sessions} />
				</SettingsGroup>
			) : null}
		</SettingsPage>
	);
}
