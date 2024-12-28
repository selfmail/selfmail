import type { authClient } from "./auth-client";
import type { auth } from "./index";

export type ActiveOrganization = typeof authClient.$Infer.ActiveOrganization;
export type Session = typeof auth.$Infer.Session;
export type Invitation = typeof authClient.$Infer.Invitation;
