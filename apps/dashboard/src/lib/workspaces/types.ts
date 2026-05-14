export type DashboardWorkspace = {
	description: string | null;
	id: string;
	image: string | null;
	memberId: string;
	name: string;
	ownerId: string;
	slug: string;
};

export type DashboardAddress = {
	addressSlug: string;
	email: string;
	handle: string;
	id: string;
};

export type DashboardAddressDomain = {
	domain: string;
	id: string;
	type: "custom" | "default";
};

export type DashboardEmail = {
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

export type DashboardInboxData = {
	addresses: DashboardAddress[];
	emails: DashboardEmail[];
};

export type DashboardAddressInboxData = DashboardInboxData & {
	address: DashboardAddress;
};

export type CreateWorkspaceAddressResult =
	| {
			addressSlug: string;
			status: "success";
	  }
	| {
			error: string;
			status: "error";
	  };
