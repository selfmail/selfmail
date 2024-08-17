import { db } from "database";
import { z } from "zod";

/**
 * Signs a user on the waitlist with his/her email address. If the
 * email already exists, it will return an error.
 * @param {string} email
 * @returns {Promise<string | undefined>}
 */
export async function waitlist(email: string): Promise<string | undefined> {
	"use server";

	const schema = await z.string().email().safeParseAsync(email);
	if (!schema.success) {
		return "Could not validate email address";
	}

	const mail = await db.waitlist
		.create({
			data: {
				email: schema.data,
			},
		})
		.catch((err) => {
			return err;
		});
	if (!mail) {
		return "Could not sign you on the waitlist";
	}

	// return nothing to indicate success
}
