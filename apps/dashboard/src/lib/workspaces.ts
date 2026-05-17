export {
	createWorkspaceAddressFn,
	removeWorkspaceMemberFn,
} from "./workspaces/mutations";
export {
	getAddressInboxFn,
	getDashboardWorkspacesFn,
	getWorkspace,
	getWorkspaceAddressDomainsFn,
	getWorkspaceInboxFn,
	getWorkspaceMembersFn,
} from "./workspaces/queries";
export type {
	CreateWorkspaceAddressResult,
	DashboardAddress,
	DashboardAddressDomain,
	DashboardAddressInboxData,
	DashboardEmail,
	DashboardInboxData,
	DashboardWorkspace,
	DashboardWorkspaceMember,
	DashboardWorkspaceMembersData,
} from "./workspaces/types";
