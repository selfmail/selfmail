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
	.get("/emails", async ({ workspace }) => {
		return await AddressService.getAddressEmails(workspace.id);
	})
	.get(
		"/emails/:addressId",
		async ({ workspace, params, query }) => {
			return await AddressService.getEmailsByAddressId({
				addressId: params.addressId,
				workspaceId: workspace.id,
				page: query.page ? Number(query.page) : 1,
				limit: query.limit ? Number(query.limit) : 20,
				search: query.search,
			});
		},
		{
			permissions: ["addresses:view"],
			params: AddressModule.addressParamsSchema,
			query: AddressModule.emailsQuerySchema,
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
		"/:addressId/details",
		async ({ params, workspace, member }) => {
			return await AddressService.getAddressDetails({
				addressId: params.addressId,
				workspaceId: workspace.id,
				memberId: member.id,
			});
		},
		{
			permissions: ["addresses:view"],
			params: AddressModule.addressParamsSchema,
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
