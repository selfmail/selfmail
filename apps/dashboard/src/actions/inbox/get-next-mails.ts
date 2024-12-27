"use server";

import { db } from "database";
import { z } from "zod";
import { orgActionClient } from "../org-action";

const schema = z.object({
	adressId: z.string().optional(),
	from: z.number(),
	take: z.number(),
});

export const getNextMails = orgActionClient
	.schema(schema)
	.action(
		async ({
			parsedInput: { adressId, from, take },
			ctx: { userId, organizationId },
		}) => {
			// count all of the email with the filters
			const emails = await db.email.findMany({
				where: {
					userId,
					organizationId,
					...(adressId && { adressId }),
				},
				select: {
					adress: {
						select: {
							email: true,
							id: true,
						},
					},
					content: true,
					createdAt: true,
					id: true,
					sender: {
						select: {
							email: true,
							id: true,
							name: true,
						},
					},
					tags: {
						select: {
							name: true,
							id: true,
						},
					},
					organization: {
						select: {
							name: true,
							id: true,
						},
					},
					plainText: true,
					preview: true,
					subject: true,
				},
				take,
				skip: from,
				orderBy: {
					createdAt: "desc",
				},
			});

			if (!emails) {
				throw new Error("No emails found");
			}

			return emails;
		},
	);
