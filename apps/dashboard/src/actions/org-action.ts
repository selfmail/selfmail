import { auth } from "auth";
import { createMiddleware } from "next-safe-action";
import { headers } from "next/headers";
import { authActionClient } from "./auth-action";

const orgMiddleware = createMiddleware().define(async ({ next }) => {
	const org = await auth.api.getFullOrganization({
		headers: await headers(),
	});

	if (!org) {
		throw new Error("No org is used");
	}

	return next({
		ctx: {
			organizationId: org.id,
		},
	});
});

export const orgActionClient = authActionClient.use(orgMiddleware);
