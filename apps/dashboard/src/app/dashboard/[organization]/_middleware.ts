// dashboard middleware

import type { MiddlewareFunctionProps } from "@rescale/nemo";
import { auth } from "auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dashboardMiddleware = async ({
	request,
	response,
	context,
	event,
	params,
}: MiddlewareFunctionProps) => {
	await Promise.all([
		auth.api.getSession({
			headers: await headers(),
		}),
		auth.api.listSessions({
			headers: await headers(),
		}),
		auth.api.getFullOrganization({
			headers: await headers(),
		}),
	]).catch((e) => {
		const url = request.nextUrl.clone()
		url.pathname = '/auth/login'
		return NextResponse.redirect(url)
	});
};
