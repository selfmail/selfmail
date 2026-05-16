import {
  ActivityIcon,
  BellIcon,
  DatabaseIcon,
  GlobeIcon,
  HardDriveIcon,
  type LucideIcon,
  PaintbrushIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  UsersIcon,
} from "lucide-react";
import { m } from "#/paraglide/messages";

export type SettingsPageId =
  | "general"
  | "notifications"
  | "appearance"
  | "domains"
  | "members"
  | "activity"
  | "data"
  | "storage"
  | "security";

export interface SettingsPage {
  description: () => string;
  icon: LucideIcon;
  id: SettingsPageId;
  title: () => string;
}

export const settingsPages = [
  {
    description: m["dashboard.settings.menu.general.description"],
    icon: SlidersHorizontalIcon,
    id: "general",
    title: m["dashboard.settings.menu.general.title"],
  },
  {
    description: m["dashboard.settings.menu.notifications.description"],
    icon: BellIcon,
    id: "notifications",
    title: m["dashboard.settings.menu.notifications.title"],
  },
  {
    description: m["dashboard.settings.menu.appearance.description"],
    icon: PaintbrushIcon,
    id: "appearance",
    title: m["dashboard.settings.menu.appearance.title"],
  },
  {
    description: m["dashboard.settings.menu.domains.description"],
    icon: GlobeIcon,
    id: "domains",
    title: m["dashboard.settings.menu.domains.title"],
  },
  {
    description: m["dashboard.settings.menu.members.description"],
    icon: UsersIcon,
    id: "members",
    title: m["dashboard.settings.menu.members.title"],
  },
  {
    description: m["dashboard.settings.menu.activity.description"],
    icon: ActivityIcon,
    id: "activity",
    title: m["dashboard.settings.menu.activity.title"],
  },
  {
    description: m["dashboard.settings.menu.data.description"],
    icon: DatabaseIcon,
    id: "data",
    title: m["dashboard.settings.menu.data.title"],
  },
  {
    description: m["dashboard.settings.menu.storage.description"],
    icon: HardDriveIcon,
    id: "storage",
    title: m["dashboard.settings.menu.storage.title"],
  },
  {
    description: m["dashboard.settings.menu.security.description"],
    icon: ShieldCheckIcon,
    id: "security",
    title: m["dashboard.settings.menu.security.title"],
  },
] as const satisfies SettingsPage[];

export const settingsPageIds = settingsPages.map((page) => page.id);

export function getSettingsPage(pageId: SettingsPageId) {
  return settingsPages.find((page) => page.id === pageId) ?? settingsPages[0];
}
