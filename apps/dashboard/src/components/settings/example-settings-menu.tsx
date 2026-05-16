import {
	ActivityIcon,
	BellIcon,
	DatabaseIcon,
	GlobeIcon,
	HardDriveIcon,
	PaintbrushIcon,
	ShieldCheckIcon,
	SlidersHorizontalIcon,
	UsersIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import {
	Button,
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
} from "#/components/ui";

type ExampleSettingsMenuProps = {
	trigger: ReactNode;
	workspaceName: string;
};

type DomainRow = {
	domain: string;
	status: string;
	type: string;
};

const domainRows: DomainRow[] = [
	{
		domain: "selfmail.dev",
		status: "Verified",
		type: "Primary",
	},
	{
		domain: "mail.selfmail.dev",
		status: "Warming",
		type: "Sending",
	},
];

const domainColumns: SettingsTableColumn<DomainRow>[] = [
	{
		cell: (row) => row.domain,
		header: "Domain",
		id: "domain",
	},
	{
		cell: (row) => row.type,
		className: "text-muted-foreground",
		header: "Type",
		id: "type",
	},
	{
		cell: (row) => row.status,
		className: "text-right",
		header: "Status",
		id: "status",
	},
];

export function ExampleSettingsMenu({
	trigger,
	workspaceName,
}: ExampleSettingsMenuProps) {
	const [weeklySummaryEnabled, setWeeklySummaryEnabled] = useState(true);
	const [auditAlertsEnabled, setAuditAlertsEnabled] = useState(false);

	return (
		<SettingsDialog>
			<SettingsDialogTrigger asChild>{trigger}</SettingsDialogTrigger>
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
							Appearance
						</SettingsMenuItem>
						<SettingsMenuItem icon={<GlobeIcon />}>Domains</SettingsMenuItem>
						<SettingsMenuItem icon={<UsersIcon />}>Members</SettingsMenuItem>
						<SettingsMenuItem icon={<ActivityIcon />}>
							Activity
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
					</SettingsMenu>
				</SettingsDialogSidebar>
				<SettingsDialogMain>
					<SettingsDialogHeader>
						<SettingsDialogTitle>{workspaceName}</SettingsDialogTitle>
						<SettingsDialogDescription>
							Adjust workspace preferences, routing, and team defaults.
						</SettingsDialogDescription>
					</SettingsDialogHeader>

					<div className="grid gap-4">
						<SettingsBanner
							action={<Button variant="outline">Review DNS</Button>}
							description="Two sending records are ready for final verification before full outbound routing is enabled."
							icon={<ShieldCheckIcon />}
							title="Protect deliverability"
							variant="info"
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
								description="Used for dashboard labels and transactional previews."
								options={[
									{ label: "Automatically detect", value: "auto" },
									{ label: "English", value: "en" },
									{ label: "German", value: "de" },
								]}
								title="Language"
							/>
							<SettingsSwitch
								checked={weeklySummaryEnabled}
								description="Send a compact delivery and activity digest every Monday."
								onCheckedChange={setWeeklySummaryEnabled}
								title="Weekly workspace summary"
							/>
							<SettingsSwitch
								checked={auditAlertsEnabled}
								description="Notify owners when sensitive workspace settings change."
								onCheckedChange={setAuditAlertsEnabled}
								title="Security audit alerts"
							/>
						</SettingsGroup>

						<div className="grid gap-3 pt-2">
							<div className="flex items-center gap-2 font-medium text-sm">
								<GlobeIcon className="size-4 text-muted-foreground" />
								Domains
							</div>
							<SettingsTable
								columns={domainColumns}
								emptyAction={<Button variant="outline">Connect domain</Button>}
								emptyDescription="Connect a domain to route workspace mail."
								getRowKey={(row) => row.domain}
								rows={domainRows}
							/>
						</div>
					</div>
				</SettingsDialogMain>
			</SettingsDialogContent>
		</SettingsDialog>
	);
}
