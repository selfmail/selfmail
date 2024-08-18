import { db } from "database";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// verify a user on the waitlist
export async function GET(
	request: NextRequest,
	context: { params: { token: string } },
) {
	const token = context.params.token;
	const schema = await z.string().uuid().safeParseAsync(token);
	if (!schema.success) {
		return NextResponse.redirect(
			new URL("/eror?error=invalid-token", request.url),
		);
	}

	// verify the user on the waitlist
	const verification = await db.waitlist.update({
		where: {
			id: schema.data,
		},
		data: {
			verified: true,
		},
	});

	if (!verification) {
		return NextResponse.redirect(
			new URL("/eror?error=cannot-verify", request.url),
		);
	}

	return NextResponse.redirect(new URL("/welcome", request.url));
}
