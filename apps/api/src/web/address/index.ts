import Elysia from "elysia";
import { requirePermissions } from "../permissions";
import { AddressModule } from "./module";
import { AddressService } from "./service";

export const address = new Elysia({
	prefix: "/address",
	name: "service/address",
})
	.use(requirePermissions)
	.post(
		"/create",
		async ({ member, workspace, body, user }) => {
			return await AddressService.createAddress({
				email: body.email,
				domain: body.domain,
				workspaceId: workspace.id,
				memberId: member.id,
				memberName: member.profileName ?? user.name,
			});
		},
		{
			permissions: ["addresses:create"],
			body: AddressModule.createAddressBody,
		},
	)
	.delete(
		"/delete",
		async ({ member, workspace, body, user }) => {
			return await AddressService.deleteAddress({
				id: body.id,
				workspaceId: workspace.id,
				memberId: member.id,
				memberName: member.profileName ?? user.name,
			});
		},
		{
			permissions: ["addresses:delete"],
			body: AddressModule.deleteAddressBody,
		},
	)
	.get(
		"/domains",
		async ({ workspace }) => {
			return await AddressService.getWorkspaceDomains(workspace.id);
		},
		{
			permissions: ["addresses:view"],
		},
	);
