// biome-ignore-all lint/style/useConsistentTypeDefinitions: Project TypeScript guidelines prefer type aliases.
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BellIcon,
  CalendarClockIcon,
  CreditCardIcon,
  DatabaseIcon,
  HardDriveIcon,
  LanguagesIcon,
  PaintbrushIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  UserCircleIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import {
  SettingsBanner,
  SettingsDialog,
  SettingsDialogContent,
  SettingsDialogDescription,
  SettingsDialogHeader,
  SettingsDialogMain,
  SettingsDialogSidebar,
  SettingsDialogTitle,
  SettingsDialogTrigger,
  SettingsGroup,
  SettingsMenu,
  SettingsMenuItem,
  SettingsSelect,
  SettingsSwitch,
  SettingsTable,
  type SettingsTableColumn,
} from "./settings-dialog";

type Member = {
  email: string;
  role: string;
  status: string;
};

const members: Member[] = [
  {
    email: "maya@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    email: "noah@example.com",
    role: "Member",
    status: "Invited",
  },
];

const memberColumns: SettingsTableColumn<Member>[] = [
  {
    cell: (member) => member.email,
    header: "Email",
    id: "email",
  },
  {
    cell: (member) => member.role,
    className: "text-muted-foreground",
    header: "Role",
    id: "role",
  },
  {
    cell: (member) => member.status,
    className: "text-right",
    header: "Status",
    id: "status",
  },
];

const meta = {
  title: "UI/Settings Dialog",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function SettingsDialogDemo() {
  const [dictationEnabled, setDictationEnabled] = useState(true);

  return (
    <SettingsDialog>
      <SettingsDialogTrigger asChild>
        <Button>Open settings</Button>
      </SettingsDialogTrigger>
      <SettingsDialogContent>
        <SettingsDialogSidebar>
          <SettingsMenu aria-label="Settings sections">
            <SettingsMenuItem active icon={<SlidersHorizontalIcon />}>
              General
            </SettingsMenuItem>
            <SettingsMenuItem icon={<BellIcon />}>
              Notifications
            </SettingsMenuItem>
            <SettingsMenuItem icon={<PaintbrushIcon />}>
              Personalization
            </SettingsMenuItem>
            <SettingsMenuItem icon={<UsersIcon />}>Apps</SettingsMenuItem>
            <SettingsMenuItem icon={<CalendarClockIcon />}>
              Schedules
            </SettingsMenuItem>
            <SettingsMenuItem icon={<CreditCardIcon />}>
              Billing
            </SettingsMenuItem>
            <SettingsMenuItem icon={<DatabaseIcon />}>
              Data controls
            </SettingsMenuItem>
            <SettingsMenuItem icon={<HardDriveIcon />}>
              Storage
            </SettingsMenuItem>
            <SettingsMenuItem icon={<ShieldCheckIcon />}>
              Security
            </SettingsMenuItem>
            <SettingsMenuItem icon={<UserCircleIcon />}>
              Account
            </SettingsMenuItem>
          </SettingsMenu>
        </SettingsDialogSidebar>
        <SettingsDialogMain>
          <SettingsDialogHeader>
            <SettingsDialogTitle>General</SettingsDialogTitle>
            <SettingsDialogDescription>
              Manage workspace behavior, appearance, and language.
            </SettingsDialogDescription>
          </SettingsDialogHeader>

          <div className="grid gap-3">
            <SettingsBanner
              action={<Button variant="outline">Set up MFA</Button>}
              description="Add multi-factor authentication with SMS or an authenticator app to better protect sign-ins."
              icon={<ShieldCheckIcon />}
              onDismiss={() => undefined}
              title="Protect your account"
            />

            <SettingsGroup>
              <SettingsSelect
                defaultValue="system"
                options={[
                  { label: "System", value: "system" },
                  { label: "Light", value: "light" },
                  { label: "Dark", value: "dark" },
                ]}
                title="Appearance"
              />
              <SettingsSelect
                defaultValue="system"
                options={[
                  { label: "System", value: "system" },
                  { label: "More contrast", value: "more" },
                  { label: "Less contrast", value: "less" },
                ]}
                title="Contrast"
              />
              <SettingsSelect
                defaultValue="blue"
                indicator={<span className="size-2 rounded-full bg-blue-500" />}
                options={[
                  { label: "Blue", value: "blue" },
                  { label: "Green", value: "green" },
                  { label: "Neutral", value: "neutral" },
                ]}
                title="Accent color"
              />
              <SettingsSelect
                defaultValue="auto"
                options={[
                  { label: "Automatically detect", value: "auto" },
                  { label: "English", value: "en" },
                  { label: "German", value: "de" },
                ]}
                title="Language"
              />
              <SettingsSwitch
                checked={dictationEnabled}
                description="Use dictation in message input fields."
                onCheckedChange={setDictationEnabled}
                title="Enable dictation"
              />
            </SettingsGroup>

            <div className="grid gap-3 pt-3">
              <div className="flex items-center gap-2 font-medium text-sm">
                <LanguagesIcon className="size-4 text-muted-foreground" />
                Team access
              </div>
              <SettingsTable
                columns={memberColumns}
                emptyAction={<Button variant="outline">Invite member</Button>}
                emptyDescription="Invite a teammate to collaborate in this workspace."
                getRowKey={(member) => member.email}
                rows={members}
              />
            </div>
          </div>
        </SettingsDialogMain>
      </SettingsDialogContent>
    </SettingsDialog>
  );
}

export const Default: Story = {
  render: () => {
    return <SettingsDialogDemo />;
  },
};

export const BannerVariants: Story = {
  render: () => (
    <div className="grid w-[32rem] max-w-[calc(100vw-2rem)] gap-3">
      <SettingsBanner
        description="Workspace settings were updated."
        title="Saved"
        variant="success"
      />
      <SettingsBanner
        description="Check billing before adding more domains."
        title="Plan limit"
        variant="warning"
      />
      <SettingsBanner
        description="The current DNS record could not be verified."
        title="Verification failed"
        variant="destructive"
      />
    </div>
  ),
};
