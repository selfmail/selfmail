import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type Params = {
	token: string;
};
// verify a user on the waitlist
export async function GET(
	request: NextRequest,
	context: { params: { token: string } },
) {
	const token = context.params.token;
	const schema = await z.string().uuid().safeParseAsync(token);

	return NextResponse.redirect(new URL("/welcome", request.url));
}
