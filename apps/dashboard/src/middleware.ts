import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// TODO: think of an better option to add auth
export async function middleware(request: NextRequest) {
    // Check if route should bypass auth
    if (
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/register") ||
        request.nextUrl.pathname.startsWith("/forgot-password")
    ) {
        return NextResponse.next();
    }

    try {
        const res = await fetch(`http://localhost:4000/api/get-session`, {
            method: "GET",
        });
        console.log(res.status)


    } catch (error) {
        console.error("Fehler in der Middleware:", error);
        // Standard-Redirect bei Fehler
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}