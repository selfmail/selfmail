import { authClient } from "./auth-client";
import type { ActiveOrganization } from "./types";

export const useActiveOrganization = () => {
	return authClient.useActiveOrganization() as {
		data: ActiveOrganization;
		error: unknown;
		isPending: boolean;
		isRefetching: boolean;
	};
};
