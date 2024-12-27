// dashboard middleware

import { betterFetch } from "@better-fetch/fetch";
import type { MiddlewareFunctionProps } from "@rescale/nemo";
import type { Session } from "better-auth";
import { NextResponse } from "next/server";

export const dashboardMiddleware = async ({
	request,
	response,
	context,
	event,
}: MiddlewareFunctionProps) => {
	let user = undefined;

	if (!context.has("user")) {
		const { data: session } = await betterFetch<Session>(
			"/api/auth/get-session",
			{
				baseURL: request.nextUrl.origin,
				headers: {
					cookie: request.headers.get("cookie") || "",
				},
			},
		);
		context.set("user", user);
	} else {
		user = context.get("user");
	}

	if (!user) {
		return NextResponse.redirect(
			new URL(
				"/auth/login?message=You%20must%20be%20logged%20in%20to%20access%20this%20page",
				request.url,
			),
		);
	}
};
