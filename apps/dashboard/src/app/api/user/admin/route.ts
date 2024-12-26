// Get information about if the user is an admin

import { auth } from "auth";
import { db } from "database";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	// check wether the user is an admin inside the db
	const user = await auth.api.getSession({
		headers: await headers(),
	});

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const isAdmin = await db.user.findUnique({
		where: {
			id: user.user.id,
			role: "admin",
		},
	});

	if (!isAdmin) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	return NextResponse.json({ isAdmin: true });
}
