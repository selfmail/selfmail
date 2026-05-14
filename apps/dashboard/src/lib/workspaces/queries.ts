import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "#/utils/auth";
import { defaultDomainId, defaultDomainSuffix } from "./constants";
import { toDashboardEmail } from "./email-format";
import { addressInboxSchema, workspaceSlugSchema } from "./schemas";
import type {
	DashboardAddressDomain,
	DashboardAddressInboxData,
	DashboardInboxData,
	DashboardWorkspace,
} from "./types";

async function getMemberAddresses(userId: string, workspaceSlug: string) {
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
				userId,
				workspace: {
					slug: workspaceSlug,
				},
			},
		},
	});

	return memberAddresses
		.map(({ address }) => address)
		.sort((first, second) => first.email.localeCompare(second.email));
}

async function getAddressEmails(addressIds: string[]) {
	if (addressIds.length === 0) {
		return [];
	}

	const emails = await db.email.findMany({
		orderBy: {
			date: "desc",
		},
		select: {
			address: {
				select: {
					email: true,
				},
			},
			attachments: true,
			date: true,
			from: true,
			id: true,
			read: true,
			subject: true,
			text: true,
		},
		take: 50,
		where: {
			addressId: {
				in: addressIds,
			},
		},
	});

	return emails.map(toDashboardEmail);
}

export const getWorkspace = createServerFn({
	method: "GET",
})
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			workspaceSlug: z.string().min(1),
		}),
	)
	.handler(async ({ context: { user }, data: { workspaceSlug } }) => {
		const member = await db.member.findFirst({
			select: {
				id: true,
				workspace: {
					select: {
						id: true,
						description: true,
						image: true,
						name: true,
						ownerId: true,
						slug: true,
					},
				},
			},
			where: {
				userId: user.id,
				workspace: {
					slug: workspaceSlug,
				},
			},
		});

		return {
			member: member ? { id: member.id } : null,
			workspace: member
				? {
						id: member.workspace.id,
						description: member.workspace.description,
						image: member.workspace.image,
						memberId: member.id,
						name: member.workspace.name,
						ownerId: member.workspace.ownerId,
						slug: member.workspace.slug,
					}
				: null,
		};
	});

export const getDashboardWorkspacesFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context: { user } }): Promise<DashboardWorkspace[]> => {
		const workspaces = await db.workspace.findMany({
			orderBy: {
				createdAt: "asc",
			},
			select: {
				id: true,
				image: true,
				Member: {
					select: {
						id: true,
					},
					take: 1,
					where: {
						userId: user.id,
					},
				},
				name: true,
				description: true,
				ownerId: true,
				slug: true,
			},
			where: {
				Member: {
					some: {
						userId: user.id,
					},
				},
			},
		});

		return workspaces.flatMap((workspace) => {
			const member = workspace.Member[0];

			return member
				? [
						{
							id: workspace.id,
							description: workspace.description,
							image: workspace.image,
							memberId: member.id,
							name: workspace.name,
							ownerId: workspace.ownerId,
							slug: workspace.slug,
						},
					]
				: [];
		});
	});

export const getWorkspaceInboxFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(workspaceSlugSchema)
	.handler(
		async ({
			context: { user },
			data: { workspaceSlug },
		}): Promise<DashboardInboxData> => {
			const addresses = await getMemberAddresses(user.id, workspaceSlug);
			const emails = await getAddressEmails(addresses.map(({ id }) => id));

			return {
				addresses,
				emails,
			};
		},
	);

export const getAddressInboxFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(addressInboxSchema)
	.handler(
		async ({
			context: { user },
			data: { addressSlug, workspaceSlug },
		}): Promise<DashboardAddressInboxData> => {
			const addresses = await getMemberAddresses(user.id, workspaceSlug);
			const address = addresses.find(
				(currentAddress) => currentAddress.addressSlug === addressSlug,
			);

			if (!address) {
				throw new Response("Address not found", { status: 404 });
			}

			const emails = await getAddressEmails([address.id]);

			return {
				address,
				addresses,
				emails,
			};
		},
	);

export const getWorkspaceAddressDomainsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(workspaceSlugSchema)
	.handler(
		async ({
			context: { user },
			data: { workspaceSlug },
		}): Promise<DashboardAddressDomain[]> => {
			const workspace = await db.workspace.findFirst({
				select: {
					id: true,
					slug: true,
					Domain: {
						orderBy: {
							domain: "asc",
						},
						select: {
							domain: true,
							id: true,
						},
						where: {
							verified: true,
						},
					},
				},
				where: {
					slug: workspaceSlug,
					Member: {
						some: {
							userId: user.id,
						},
					},
				},
			});

			if (!workspace) {
				throw new Response("Workspace not found", { status: 404 });
			}

			return [
				{
					domain: `${workspace.slug}.${defaultDomainSuffix}`,
					id: defaultDomainId,
					type: "default",
				},
				...workspace.Domain.map((domain) => ({
					domain: domain.domain,
					id: domain.id,
					type: "custom" as const,
				})),
			];
		},
	);
