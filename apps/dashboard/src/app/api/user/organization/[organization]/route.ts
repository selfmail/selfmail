// Get information about if the user is in a team

import { auth } from "auth";
import { db } from "database";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ organization: string }> },
) {
	const organization = (await params).organization;

	const user = await auth.api.getSession({
		headers: await headers(),
	});

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// get the members of this organization

	const members = await db.member.findMany({
		where: {
			userId: user.user.id,
			organizationId: organization,
		},
	});

	if (!members || members.length === 0) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	return NextResponse.json({ isMember: true });
}
