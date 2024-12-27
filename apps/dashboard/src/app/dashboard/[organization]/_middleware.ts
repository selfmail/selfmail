// dashboard middleware

import { betterFetch } from "@better-fetch/fetch";
import type { MiddlewareFunctionProps } from "@rescale/nemo";
import { auth } from "auth";
import type { Session } from "better-auth";
import { NextResponse } from "next/server";

type SessionData = {
	session: Session;
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		image: string | null;
		createdAt: string;
		updatedAt: string;
		role: string;
		banned: boolean;
		banReason: string | null;
		banExpires: string | null;
		username: string;
	};
};

export const dashboardMiddleware = async ({
	request,
	response,
	context,
	event,
	params,
}: MiddlewareFunctionProps) => {
	let user: undefined | string = undefined;

	if (!context.has("user")) {
		const { data: session } = await betterFetch<SessionData>(
			"/api/auth/get-session",
			{
				baseURL: request.nextUrl.origin,
				headers: {
					cookie: request.headers.get("cookie") || "",
				},
			},
		);
		if (session?.session?.userId) {
			context.set("user", session.session.userId);
			user = session.session.userId;
		}
	} else {
		user = context.get("user") as string | undefined;
	}

	if (!user) {
		return NextResponse.redirect(
			new URL(
				"/auth/login?message=You%20must%20be%20logged%20in%20to%20access%20this%20page",
				request.url,
			),
		);
	}

	// checking the current org

	const orgId = params().organization;

	if (!orgId)
		return NextResponse.redirect(
			new URL(
				"/auth/login?message=You%20must%20be%20logged%20in%20to%20access%20this%20page",
				request.url,
			),
		);

	// checking if the user is part of this org
	await auth.api.getActiveMember();
};
