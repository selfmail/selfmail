export interface WorkspaceSummary {
  id: string;
  image: string | null;
  name: string;
  slug: string;
}

export interface DashboardWorkspaceProps {
  currentWorkspace: WorkspaceSummary;
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
}
