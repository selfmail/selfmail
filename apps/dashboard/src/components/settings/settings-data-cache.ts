import type {
	DashboardWorkspaceDomainsData,
	DashboardWorkspaceMembersData,
	DashboardWorkspaceSettingsData,
} from "#/lib/workspaces";

export const settingsDataCache = {
	domains: new Map<string, DashboardWorkspaceDomainsData>(),
	members: new Map<string, DashboardWorkspaceMembersData>(),
	workspace: new Map<string, DashboardWorkspaceSettingsData>(),
};
