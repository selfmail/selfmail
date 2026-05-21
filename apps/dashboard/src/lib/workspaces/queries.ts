import { db } from "@selfmail/db";
import { permissions as getPermissions } from "@selfmail/permissions";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "#/utils/auth";
import { defaultDomainId, defaultDomainSuffix } from "./constants";
import {
	detectDnsProvider,
	toDashboardWorkspaceDomain,
} from "./domain-presenter";
import { toDashboardEmail } from "./email-format";
import { addressInboxSchema, workspaceSlugSchema } from "./schemas";
import type {
	DashboardAddressDomain,
	DashboardAddressInboxData,
	DashboardInboxData,
	DashboardWorkspace,
	DashboardWorkspaceDomainsData,
	DashboardWorkspaceMembersData,
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

export const getDashboardEmailFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			emailId: z.string().min(1),
		}),
	)
	.handler(async ({ context: { user }, data: { emailId } }) => {
		const email = await db.email.findFirst({
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
			where: {
				id: emailId,
				address: {
					MemberAddress: {
						some: {
							member: {
								userId: user.id,
							},
						},
					},
				},
			},
		});

		if (!email) {
			throw new Response("Email not found", { status: 404 });
		}

		return toDashboardEmail(email);
	});

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

export const getWorkspaceDomainsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(workspaceSlugSchema)
	.handler(
		async ({
			context: { user },
			data: { workspaceSlug },
		}): Promise<DashboardWorkspaceDomainsData> => {
			const currentMember = await db.member.findFirst({
				select: {
					id: true,
					workspace: {
						select: {
							id: true,
							Domain: {
								orderBy: {
									createdAt: "desc",
								},
								select: {
									_count: {
										select: {
											addresses: true,
										},
									},
									createdAt: true,
									domain: true,
									id: true,
									verificationToken: true,
									verified: true,
									verifiedAt: true,
								},
							},
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

			if (!currentMember) {
				throw new Response("Workspace not found", { status: 404 });
			}

			const grantedPermissions = await getPermissions({
				memberId: currentMember.id,
				permissions: ["domains:add", "domains:delete", "domains:update"],
				workspaceId: currentMember.workspace.id,
			});
			const domains = await Promise.all(
				currentMember.workspace.Domain.map(async (domain) =>
					toDashboardWorkspaceDomain(
						domain,
						await detectDnsProvider(domain.domain),
					),
				),
			);

			return {
				canAddDomains: grantedPermissions.includes("domains:add"),
				canDeleteDomains: grantedPermissions.includes("domains:delete"),
				canVerifyDomains:
					grantedPermissions.includes("domains:add") ||
					grantedPermissions.includes("domains:update"),
				domains,
			};
		},
	);

export const getWorkspaceMembersFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(workspaceSlugSchema)
	.handler(
		async ({
			context: { user },
			data: { workspaceSlug },
		}): Promise<DashboardWorkspaceMembersData> => {
			const currentMember = await db.member.findFirst({
				select: {
					id: true,
					workspace: {
						select: {
							id: true,
							ownerId: true,
							Member: {
								orderBy: {
									createdAt: "asc",
								},
								select: {
									id: true,
									image: true,
									profileName: true,
									storageBytes: true,
									createdAt: true,
									userId: true,
									user: {
										select: {
											email: true,
										},
									},
									MemberAddress: {
										select: {
											addressId: true,
										},
									},
									MemberPermission: {
										select: {
											permissionName: true,
										},
									},
									roles: {
										select: {
											name: true,
										},
									},
								},
							},
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

			if (!currentMember) {
				throw new Response("Workspace not found", { status: 404 });
			}

			const removePermissions = await getPermissions({
				memberId: currentMember.id,
				permissions: ["members:remove"],
				workspaceId: currentMember.workspace.id,
			});
			const canRemoveMembers = removePermissions.includes("members:remove");

			return {
				canRemoveMembers,
				members: currentMember.workspace.Member.map((member) => ({
					addressCount: member.MemberAddress.length,
					email: member.user.email,
					id: member.id,
					image: member.image,
					isCurrentMember: member.id === currentMember.id,
					isOwner: member.userId === currentMember.workspace.ownerId,
					joinedAt: member.createdAt.toISOString(),
					permissions: member.MemberPermission.map(
						(permission) => permission.permissionName,
					),
					profileName: member.profileName,
					roles: member.roles.map((role) => role.name),
					storageBytes: member.storageBytes.toString(),
				})),
			};
		},
	);
