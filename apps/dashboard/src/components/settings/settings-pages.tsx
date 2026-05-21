import {
	CreditCardIcon,
	DatabaseIcon,
	GlobeIcon,
	HardDriveIcon,
	LifeBuoyIcon,
	type LucideIcon,
	SettingsIcon,
	ShieldCheckIcon,
	SlidersHorizontalIcon,
	UsersIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { m } from "#/paraglide/messages";
import { AppSettingsPage } from "./app-settings-page";
import { DomainSettingsPage } from "./domain-settings-page";
import { MemberSettingsPage } from "./member-settings-page";
import { PlaceholderSettingsPage } from "./placeholder-settings-page";

export type SettingsPageId =
	| "app"
	| "workspace"
	| "billing"
	| "auditLogs"
	| "storage"
	| "support"
	| "domains"
	| "members"
	| "workspaceAi";

export interface SettingsPageContext {
	page: SettingsPage;
	workspaceName: string;
	workspaceSlug: string;
}

export type SettingsPageComponent = (props: SettingsPageContext) => ReactNode;

export interface SettingsPage {
	component: SettingsPageComponent;
	description?: () => string;
	icon: LucideIcon;
	id: SettingsPageId;
	title: () => string;
}

// Route metadata and renderers stay together so expensive settings pages can
// load their own data only after their query-state route is selected.
export const settingsPages = [
	{
		component: AppSettingsPage,
		icon: SlidersHorizontalIcon,
		id: "app",
		title: m["dashboard.settings.menu.app.title"],
	},
	{
		component: PlaceholderSettingsPage,
		description: m["dashboard.settings.menu.workspace.description"],
		icon: SettingsIcon,
		id: "workspace",
		title: m["dashboard.settings.menu.workspace.title"],
	},
	{
		component: PlaceholderSettingsPage,
		description: m["dashboard.settings.menu.billing.description"],
		icon: CreditCardIcon,
		id: "billing",
		title: m["dashboard.settings.menu.billing.title"],
	},
	{
		component: PlaceholderSettingsPage,
		description: m["dashboard.settings.menu.audit_logs.description"],
		icon: ShieldCheckIcon,
		id: "auditLogs",
		title: m["dashboard.settings.menu.audit_logs.title"],
	},
	{
		component: PlaceholderSettingsPage,
		description: m["dashboard.settings.menu.storage.description"],
		icon: HardDriveIcon,
		id: "storage",
		title: m["dashboard.settings.menu.storage.title"],
	},
	{
		component: PlaceholderSettingsPage,
		description: m["dashboard.settings.menu.support.description"],
		icon: LifeBuoyIcon,
		id: "support",
		title: m["dashboard.settings.menu.support.title"],
	},
	{
		component: DomainSettingsPage,
		description: m["dashboard.settings.menu.domains.description"],
		icon: GlobeIcon,
		id: "domains",
		title: m["dashboard.settings.menu.domains.title"],
	},
	{
		component: MemberSettingsPage,
		description: m["dashboard.settings.menu.members.description"],
		icon: UsersIcon,
		id: "members",
		title: m["dashboard.settings.menu.members.title"],
	},
	{
		component: PlaceholderSettingsPage,
		description: m["dashboard.settings.menu.workspace_ai.description"],
		icon: DatabaseIcon,
		id: "workspaceAi",
		title: m["dashboard.settings.menu.workspace_ai.title"],
	},
] as const satisfies SettingsPage[];

export const settingsPageIds = settingsPages.map((page) => page.id);

export function getSettingsPage(pageId: SettingsPageId) {
	return settingsPages.find((page) => page.id === pageId) ?? settingsPages[0];
}
