"use server";

import { db } from "database";
import { z } from "zod";
import { authActionClient } from "../auth-action";

const schema = z.object({
	organizationId: z.string().cuid2(),
	adressId: z.string().cuid2().optional(),
});

export const countEmails = authActionClient
	.schema(schema)
	.action(
		async ({ parsedInput: { organizationId, adressId }, ctx: { userId } }) => {
			// count all of the email with the filters
			const emailCount = await db.email.count({
				where: {
					userId,
					organizationId,
					...(adressId && { adressId }),
				},
			});

			return emailCount;
		},
	);
