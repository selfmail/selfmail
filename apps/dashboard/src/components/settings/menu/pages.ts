import {
  AtSignIcon,
  CreditCardIcon,
  DatabaseIcon,
  GlobeIcon,
  HardDriveIcon,
  KeyRoundIcon,
  LifeBuoyIcon,
  type LucideIcon,
  SettingsIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  UsersIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { m } from "#/paraglide/messages";
import type { Page } from "..";
import { AddressSettingsPage } from "../addresses";
import { AppSettingsPage } from "../app";
import { AuthenticationSettingsPage } from "../authentication";
import { DomainSettingsPage } from "../domains";
import { MemberSettingsPage } from "../members";
import { PlaceholderSettingsPage } from "../placeholder-settings-page";
import { WorkspaceSettingsPage } from "../workspace";

export interface SettingsPageContext {
  title: () => string;
  description?: () => string;
  id: string;
  workspaceId: string;
  memberId: string;
}

interface SettingsPage {
  title: () => string;
  id: Page;
  component: (props: SettingsPageContext) => ReactNode;
  icon: LucideIcon;
  description?: () => string;
}
export const settingsPages: SettingsPage[] = [
  {
    component: AppSettingsPage,
    icon: SlidersHorizontalIcon,
    id: "app",
    title: m["dashboard.settings.menu.app.title"],
  },
  {
    component: WorkspaceSettingsPage,
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
    component: AddressSettingsPage,
    description: m["dashboard.settings.menu.addresses.description"],
    icon: AtSignIcon,
    id: "addresses",
    title: m["dashboard.settings.menu.addresses.title"],
  },
  {
    component: AuthenticationSettingsPage,
    description: m["dashboard.settings.menu.authentication.description"],
    icon: KeyRoundIcon,
    id: "authentication",
    title: m["dashboard.settings.menu.authentication.title"],
  },
  {
    component: PlaceholderSettingsPage,
    description: m["dashboard.settings.menu.spam_analysis.description"],
    icon: ShieldAlertIcon,
    id: "spamAnalysis",
    title: m["dashboard.settings.menu.spam_analysis.title"],
  },
  {
    component: PlaceholderSettingsPage,
    description: m["dashboard.settings.menu.workspace_ai.description"],
    icon: DatabaseIcon,
    id: "workspaceAi",
    title: m["dashboard.settings.menu.workspace_ai.title"],
  },
] as const;
