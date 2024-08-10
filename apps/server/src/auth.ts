import { db } from "database";
import type { Context } from "hono";

/**
 * Authentication for the api.
 *
 * Every user can create one api key. This api key has only permissions to perform
 * actions for the user, the api key is not able to send email in the name of another
 * user for example. There are also service api keys, for example for the dashboard
 * or for the cloudflare workers.
 */
export async function auth({
	token,
}: {
	token: string;
	context: Context;
}): Promise<boolean> {
	console.log(token);
	const key = await db.key.findUnique({
		where: {
			token,
		},
	});
	if (!key) return false;
	// service api key
	console.log("key is there");
	if (key?.service) return true;

	// checking if the user has the permissions to send or receive an email with this api key
	// TODO: implement this security thing
	return true;
}
