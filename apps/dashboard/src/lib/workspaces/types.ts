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
