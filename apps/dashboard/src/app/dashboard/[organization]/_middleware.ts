// dashboard middleware

import type { MiddlewareFunctionProps } from "@rescale/nemo";
import { NextResponse } from "next/server";

export const dashboardMiddleware = async ({
	request,
	response,
	context,
	event,
	params,
	forward
}: MiddlewareFunctionProps) => {
	console.log(params().organization, new Date())
	if (!params().organization) {
		throw new Error("Organization not defined.")
	}
	console.log(`${request.nextUrl.origin}/api/user/check/${params().organization}`)
	const res = await fetch(`${request.nextUrl.origin}/api/user/check/${params().organization}`, {
		cache: "no-store",
		method: "GET"
	})

	if (!res.ok) console.log(`Response not OK! Status: ${res.status}, Time: ${new Date().toLocaleTimeString()}`)

	const url = request.nextUrl.clone()
	url.pathname = '/auth/login'
	if (!res.ok) return NextResponse.redirect(url)


};
