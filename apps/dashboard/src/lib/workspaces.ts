export {
	createWorkspaceAddressFn,
	deleteWorkspaceFn,
	updateWorkspaceSettingsFn,
} from "./workspaces/mutations";
export {
	getAddressInboxFn,
	getDashboardWorkspacesFn,
	getWorkspace,
	getWorkspaceAddressDomainsFn,
	getWorkspaceInboxFn,
} from "./workspaces/queries";
export type {
	CreateWorkspaceAddressResult,
	DashboardAddress,
	DashboardAddressDomain,
	DashboardAddressInboxData,
	DashboardEmail,
	DashboardInboxData,
	DashboardWorkspace,
} from "./workspaces/types";
