export interface DashboardWorkspace {
	description: string | null;
	id: string;
	image: string | null;
	memberId: string;
	name: string;
	ownerId: string;
	slug: string;
}

export interface DashboardAddress {
	addressSlug: string;
	email: string;
	handle: string;
	id: string;
}

export interface DashboardAddressDomain {
	domain: string;
	id: string;
	type: "custom" | "default";
}

export interface DashboardDomainDnsRecord {
	host: string;
	priority?: number;
	type: "MX" | "TXT";
	value: string;
}

export interface DashboardWorkspaceDomain {
	addressCount: number;
	createdAt: string;
	dnsProvider: "cloudflare" | "other" | "unknown";
	dnsRecords: DashboardDomainDnsRecord[];
	domain: string;
	id: string;
	status: "pending" | "verified";
	verifiedAt: string | null;
}

export interface DashboardWorkspaceDomainsData {
	canAddDomains: boolean;
	canDeleteDomains: boolean;
	canVerifyDomains: boolean;
	domains: DashboardWorkspaceDomain[];
}

export interface DashboardWorkspaceMember {
	addressCount: number;
	email: string;
	id: string;
	image: string | null;
	isCurrentMember: boolean;
	isOwner: boolean;
	joinedAt: string;
	permissions: string[];
	profileName: string;
	roles: string[];
	storageBytes: string;
}

export interface DashboardWorkspaceMembersData {
	canRemoveMembers: boolean;
	members: DashboardWorkspaceMember[];
}

export interface DashboardWorkspaceSettingsData {
	counts: {
		addresses: number;
		domains: number;
		drafts: number;
		emails: number;
		members: number;
		storageBytes: string;
	};
	permissions: {
		canDeleteWorkspace: boolean;
		canUpdateWorkspace: boolean;
	};
	workspace: {
		createdAt: string;
		defaultDomain: string;
		description: string | null;
		id: string;
		isOwner: boolean;
		name: string;
		slug: string;
		updatedAt: string;
	};
}

export interface DashboardEmail {
	attachments?: number;
	date: string;
	from: string;
	id: string;
	initial: string;
	read?: boolean;
	snippet: string;
	subject: string;
	to?: string;
}

export interface DashboardInboxData {
	addresses: DashboardAddress[];
	emails: DashboardEmail[];
}

export interface DashboardAddressInboxData extends DashboardInboxData {
	address: DashboardAddress;
}

export interface CreateWorkspaceAddressSuccess {
	addressSlug: string;
	status: "success";
}

export interface CreateWorkspaceAddressError {
	error: string;
	status: "error";
}

export type CreateWorkspaceAddressResult =
	| CreateWorkspaceAddressSuccess
	| CreateWorkspaceAddressError;

export interface WorkspaceDomainSuccess {
	domain: DashboardWorkspaceDomain;
	status: "success";
}

export interface WorkspaceDomainError {
	error: string;
	status: "error";
}

export type WorkspaceDomainResult =
	| WorkspaceDomainSuccess
	| WorkspaceDomainError;

export interface DeleteWorkspaceDomainSuccess {
	status: "success";
}

export type DeleteWorkspaceDomainResult =
	| DeleteWorkspaceDomainSuccess
	| WorkspaceDomainError;

export interface RemoveWorkspaceMemberSuccess {
	status: "success";
}

export interface RemoveWorkspaceMemberError {
	error: string;
	status: "error";
}

export type RemoveWorkspaceMemberResult =
	| RemoveWorkspaceMemberSuccess
	| RemoveWorkspaceMemberError;

export interface WorkspaceSettingsSuccess {
	status: "success";
	workspace: DashboardWorkspaceSettingsData["workspace"];
}

export interface WorkspaceSettingsError {
	error: string;
	status: "error";
}

export type WorkspaceSettingsResult =
	| WorkspaceSettingsSuccess
	| WorkspaceSettingsError;

export type WorkspaceDataExportValue =
	| WorkspaceDataExportValue[]
	| boolean
	| null
	| number
	| string
	| { [key: string]: WorkspaceDataExportValue };

export interface WorkspaceDataExport {
	exportedAt: string;
	member: {
		createdAt: string;
		description: string | null;
		id: string;
		image: string | null;
		permissions: string[];
		profileName: string;
		roles: string[];
		storageBytes: string;
	};
	user: {
		email: string;
		id: string;
		name: string | null;
	};
	workspace: {
		description: string | null;
		id: string;
		name: string;
		slug: string;
	};
	data: {
		addresses: WorkspaceDataExportValue[];
		contacts: WorkspaceDataExportValue[];
		drafts: WorkspaceDataExportValue[];
		emails: WorkspaceDataExportValue[];
		notifications: WorkspaceDataExportValue[];
		smtpCredentials: WorkspaceDataExportValue[];
	};
}

export interface WorkspaceDataExportSuccess {
	data: WorkspaceDataExport;
	status: "success";
}

export type WorkspaceDataExportResult =
	| WorkspaceDataExportSuccess
	| WorkspaceSettingsError;
