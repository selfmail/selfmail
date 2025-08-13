import Elysia from "elysia";
import { requirePermissions } from "../permissions";
import { DomainModule } from "./module";
import { DomainService } from "./service";

export const domain = new Elysia({
	prefix: "/domain",
	name: "service/domains",
})
	.use(requirePermissions)
	.post(
		"/add",
		async ({ member, workspace, body, user }) => {
			return await DomainService.addDomain({
				memberName: member.profileName ?? user.name,
				domain: body.domain,
				workspaceId: workspace.id,
			});
		},
		{
			permissions: ["domains:add"],
			body: DomainModule.addDomainBody,
		},
	)
	.post(
		"/remove",
		async ({ user, workspace, member, body }) => {
			return await DomainService.removeDomain({
				id: body.id,
				workspaceId: workspace.id,
				memberName: member.profileName ?? user.name,
			});
		},
		{
			permissions: ["domains:remove"],
			body: DomainModule.removeDomainBody,
		},
	)
	.get(
		"/check/:id",
		async ({ workspace, params }) => {
			const { id } = params;

			return await DomainService.checkDomain({
				domainId: id,
				workspaceId: workspace.id,
			});
		},
		{
			permissions: ["domains:check"],
		},
	);
