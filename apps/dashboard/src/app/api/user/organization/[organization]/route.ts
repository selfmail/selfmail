// Get information about if the user is in a team

import { betterFetch } from "@better-fetch/fetch";
import { auth } from "auth";
import type { Session } from "better-auth";
import { db } from "database";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

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

// Checks if the organization is the current active organization. If not, this will be updated. If the user
// doesn't belongs to this organization, he has to login again with an error code.
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ organization: string }> },
) {
	const organization = (await params).organization;
	console.log(organization, (await cookies()).get("__Secure-selfmail.session_token"))

	if (!(await cookies()).get("__Secure-selfmail.session_token")) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { data: session } = await betterFetch<SessionData>(
		"/api/auth/get-session",
		{
			baseURL: "http://localhost:4000",
			headers: {
				cookie: request.cookies.get("__Secure-selfmail.session_token")?.value || "",
			},
		},
	);
	console.log(`This is the user: ${session?.user}`);

	if (!session) {
		console.log("no session")
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// get the members of this organization
	const currentActiveOrg = await auth.api.getFullOrganization({
		headers: request.headers,
	});

	if (currentActiveOrg?.id === organization) {
		// orgs are not matching, checking if the user is inside this org
		const members = await db.member.findMany({
			where: {
				userId: session.user.id,
				organizationId: organization,
			},
		});

		if (!members || members.length === 0) {
			console.log("members")
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await auth.api.setActiveOrganization({
			body: {
				organizationId: "organization-id",
			},
		});
	}

	return NextResponse.json({ isMember: true });
}
