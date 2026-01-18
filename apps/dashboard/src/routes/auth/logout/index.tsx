import type { RequestHandler } from "@builder.io/qwik-city";
import { db } from "database";

export const onGet: RequestHandler = async ({ cookie, redirect }) => {
	const sessionToken = cookie.get("selfmail-session-token")?.value;

	if (sessionToken) {
		// Delete the session from the database
		await db.session.deleteMany({
			where: {
				sessionToken,
			},
		});

		// Clear the session cookie
		cookie.delete("selfmail-session-token", {
			path: "/",
		});
	}

	// Redirect to login page
	const HTTP_FOUND = 302;
	throw redirect(HTTP_FOUND, "/auth/login");
};
