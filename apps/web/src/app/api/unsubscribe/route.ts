import { type NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
	return NextResponse.redirect(new URL("/unsubscribe", req.url));
}
