import type { RequestHandler } from "@builder.io/qwik-city";
import { db } from "database";
import {
  clearSessionCookie,
  createLoginUrl,
  hashToken,
  SESSION_COOKIE_NAME,
} from "~/lib/auth";

export const onGet: RequestHandler = async ({ cookie, redirect, url }) => {
	const sessionToken = cookie.get(SESSION_COOKIE_NAME)?.value;

	if (sessionToken) {
		const sessionTokenHash = await hashToken(sessionToken);

		await db.session.deleteMany({
			where: {
				sessionToken: sessionTokenHash,
			},
		});
	}

	clearSessionCookie(cookie, url);
	throw redirect(302, createLoginUrl(url));
};
