import { t } from "elysia";

export namespace DomainModule {
	export const addDomainBody = t.Object({
		domain: t.String({
			minLength: 2,
			maxLength: 100,
		}),
	});
	export type AddDomainBody = typeof addDomainBody.static;

	// remove domain
	export const removeDomainBody = t.Object({
		id: t.String(),
	});
	export type RemoveDomainBody = typeof removeDomainBody.static;

	// list domains
	export const listDomainsBody = t.Object({
		workspaceId: t.String(),
	});
	export type ListDomainsBody = typeof listDomainsBody.static;

	// check domains for required dns entries
	export const checkDomainBody = t.Object({
		domainId: t.String(),
	});
	export type CheckDomainBody = typeof checkDomainBody.static;
}
