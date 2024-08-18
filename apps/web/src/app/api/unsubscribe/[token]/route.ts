import { db } from "database";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// TODO: make it secure
export async function GET(
	req: NextRequest,
	context: { params: { token: string } },
) {
	const schema = await z.string().uuid().safeParseAsync(context.params.token);
	if (!schema.success) {
		return NextResponse.redirect(new URL("/eror?error=invalid-token", req.url));
	}

	// delete the email from the waitlist
	const email = await db.waitlist.delete({
		where: {
			id: schema.data,
		},
		select: {
			email: true,
		},
	});

	if (!email) {
		return NextResponse.redirect(
			new URL("/eror?error=user-not-found", req.url),
		);
	}

	// redirect to unsubscribe page, all done without an error
	return NextResponse.redirect(new URL("/unsubscribe", req.url));
}
