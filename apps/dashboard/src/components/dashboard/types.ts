export type WorkspaceSummary = {
	id: string;
	image: string | null;
	name: string;
	slug: string;
};

export type DashboardAddress = {
	addressSlug: string;
	email: string;
	handle: string;
	id: string;
};

export type DashboardHeaderProps = {
	currentWorkspace: WorkspaceSummary;
	workspaces: WorkspaceSummary[];
};

export type DashboardWorkspaceProps = {
	addresses: DashboardAddress[];
	currentAddressSlug?: string;
	currentWorkspace: WorkspaceSummary;
	emails: Email[];
	subtitle?: string;
	title?: string;
	workspaces: WorkspaceSummary[];
};

export type Email = {
	attachments?: number;
	date: string;
	from: string;
	id: string;
	initial: string;
	read?: boolean;
	snippet: string;
	subject: string;
	to?: string;
};
