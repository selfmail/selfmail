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
  description: string;
  icon: LucideIcon;
  id: SettingsPageId;
  title: string;
}

export const settingsPages = [
  {
    description: "Workspace profile, defaults, and high-level preferences.",
    icon: SlidersHorizontalIcon,
    id: "general",
    title: "General",
  },
  {
    description: "Message, delivery, and activity notification defaults.",
    icon: BellIcon,
    id: "notifications",
    title: "Notifications",
  },
  {
    description: "Theme, contrast, language, and visual preferences.",
    icon: PaintbrushIcon,
    id: "appearance",
    title: "Appearance",
  },
  {
    description: "Connected domains and routing configuration.",
    icon: GlobeIcon,
    id: "domains",
    title: "Domains",
  },
  {
    description: "Workspace access, roles, and invitations.",
    icon: UsersIcon,
    id: "members",
    title: "Members",
  },
  {
    description: "Audit trail and recent workspace changes.",
    icon: ActivityIcon,
    id: "activity",
    title: "Activity",
  },
  {
    description: "Export, retention, and privacy controls.",
    icon: DatabaseIcon,
    id: "data",
    title: "Data controls",
  },
  {
    description: "Mailbox storage and attachment limits.",
    icon: HardDriveIcon,
    id: "storage",
    title: "Storage",
  },
  {
    description: "Authentication, sessions, and protective checks.",
    icon: ShieldCheckIcon,
    id: "security",
    title: "Security",
  },
] as const satisfies SettingsPage[];

export const settingsPageIds = settingsPages.map((page) => page.id);

export function getSettingsPage(pageId: SettingsPageId) {
  return settingsPages.find((page) => page.id === pageId) ?? settingsPages[0];
}
