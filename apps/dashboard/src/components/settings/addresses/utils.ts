import type { DashboardAddress } from "#/lib/workspaces/types";

export const emptyAddresses: DashboardAddress[] = [];

export const toAddressLocalPart = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9._-]+/g, "")
		.replace(/^[._-]+|[._-]+$/g, "");

export function getAddressDomain(email: string) {
	return email.split("@").at(1) ?? "";
}
