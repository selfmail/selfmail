import type { RequestHandler } from "@builder.io/qwik-city";
import { middlewareAuthentication } from "~/lib/auth";

export const onRequest: RequestHandler = async ({ next, cookie, redirect }) => {
    const sessionToken = cookie.get("session-token")?.value;

    const { authenticated } = await middlewareAuthentication(sessionToken);

    if (!authenticated) {
        throw redirect(300, "/auth/login");
    }

    await next();
};