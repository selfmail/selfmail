import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "#/utils/auth";

export const getMemberAddresses = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			workspaceSlug: z.string(),
		}),
	)
	.handler(async ({ context: { user }, data: { workspaceSlug } }) => {
		const memberAddresses = await db.memberAddress.findMany({
			select: {
				address: {
					select: {
						addressSlug: true,
						email: true,
						handle: true,
						id: true,
					},
				},
			},
			where: {
				member: {
					userId: user.id,
					workspace: {
						slug: workspaceSlug,
					},
				},
			},
		});

		return memberAddresses
			.map(({ address }) => address)
			.sort((first, second) => first.email.localeCompare(second.email));
	});
