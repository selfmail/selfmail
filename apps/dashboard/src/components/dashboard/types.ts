export interface WorkspaceSummary {
  id: string;
  image: string | null;
  name: string;
  slug: string;
}

export interface DashboardAddress {
  addressSlug: string;
  email: string;
  handle: string;
  id: string;
}

export interface DashboardHeaderProps {
  currentWorkspace: WorkspaceSummary;
  workspaces: WorkspaceSummary[];
}

export interface DashboardWorkspaceProps {
  addresses: DashboardAddress[];
  currentAddressSlug?: string;
  currentWorkspace: WorkspaceSummary;
  emails: Email[];
  memberId: string;
  subtitle?: string;
  title?: string;
  workspaces: WorkspaceSummary[];
}

export interface Email {
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
