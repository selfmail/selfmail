import { db, type User } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "#/utils/auth";

export type DashboardWorkspace = {
	description: string | null;
	id: string;
	image: string | null;
	memberId: string;
	name: string;
	ownerId: string;
	slug: string;
};

export type DashboardShellData = {
	user: User;
	workspace: DashboardWorkspace | null;
};

const workspaceSettingsSchema = z.object({
	description: z.string().max(240).optional(),
	image: z
		.union([z.url("Image must be a valid URL."), z.literal("")])
		.optional(),
	name: z.string().trim().min(1, "Workspace name is required.").max(120),
	slug: z
		.string()
		.trim()
		.min(1, "Workspace handle is required.")
		.max(63, "Workspace handle is too long.")
		.regex(
			/^(?:[a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$/,
			"Use lowercase letters, numbers, and hyphens.",
		),
	workspaceId: z.string().min(1),
});

const workspaceDeleteSchema = z.object({
	workspaceId: z.string().min(1),
});

async function getOwnedWorkspace(userId: string, workspaceId: string) {
	return db.workspace.findFirst({
		select: {
			id: true,
			slug: true,
		},
		where: {
			id: workspaceId,
			ownerId: userId,
		},
	});
}

export const getDashboardShellDataFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context: { user } }): Promise<DashboardShellData> => {
		const workspace = await db.workspace.findFirst({
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

		const member = workspace?.Member[0];

		return {
			user,
			workspace:
				workspace && member
					? {
							id: workspace.id,
							description: workspace.description,
							image: workspace.image,
							memberId: member.id,
							name: workspace.name,
							ownerId: workspace.ownerId,
							slug: workspace.slug,
						}
					: null,
		};
	});

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

export const updateWorkspaceSettingsFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(workspaceSettingsSchema)
	.handler(async ({ context: { user }, data }) => {
		const workspace = await getOwnedWorkspace(user.id, data.workspaceId);

		if (!workspace) {
			return {
				error: "Only the workspace owner can update workspace settings.",
				status: "error" as const,
			};
		}

		const slug = data.slug.toLowerCase();
		const slugOwner = await db.workspace.findFirst({
			select: {
				id: true,
			},
			where: {
				id: {
					not: data.workspaceId,
				},
				slug,
			},
		});

		if (slugOwner) {
			return {
				error: "This workspace handle is already taken.",
				status: "error" as const,
			};
		}

		const updatedWorkspace = await db.workspace.update({
			data: {
				description: data.description?.trim() || null,
				image: data.image?.trim() || null,
				name: data.name.trim(),
				slug,
			},
			select: {
				slug: true,
			},
			where: {
				id: data.workspaceId,
			},
		});

		return {
			slug: updatedWorkspace.slug,
			status: "success" as const,
		};
	});

export const deleteWorkspaceFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(workspaceDeleteSchema)
	.handler(async ({ context: { user }, data }) => {
		const workspace = await getOwnedWorkspace(user.id, data.workspaceId);

		if (!workspace) {
			return {
				error: "Only the workspace owner can delete this workspace.",
				status: "error" as const,
			};
		}

		try {
			await db.$transaction(async (tx) => {
				const [domainAddresses, members, roles] = await Promise.all([
					tx.address.findMany({
						select: {
							id: true,
						},
						where: {
							Domain: {
								workspaceId: data.workspaceId,
							},
						},
					}),
					tx.member.findMany({
						select: {
							id: true,
						},
						where: {
							workspaceId: data.workspaceId,
						},
					}),
					tx.role.findMany({
						select: {
							id: true,
						},
						where: {
							workspaceId: data.workspaceId,
						},
					}),
				]);
				const memberIds = members.map(({ id }) => id);
				const roleIds = roles.map(({ id }) => id);
				const memberAddresses = await tx.memberAddress.findMany({
					select: {
						addressId: true,
					},
					where: {
						memberId: {
							in: memberIds,
						},
					},
				});
				const addressIds = [
					...new Set([
						...domainAddresses.map(({ id }) => id),
						...memberAddresses.map(({ addressId }) => addressId),
					]),
				];

				await tx.email.deleteMany({
					where: {
						addressId: {
							in: addressIds,
						},
					},
				});
				await tx.contact.deleteMany({
					where: {
						addressId: {
							in: addressIds,
						},
					},
				});
				await tx.smtpCredentials.deleteMany({
					where: {
						workspaceId: data.workspaceId,
					},
				});
				await tx.memberAddress.deleteMany({
					where: {
						OR: [
							{
								addressId: {
									in: addressIds,
								},
							},
							{
								memberId: {
									in: memberIds,
								},
							},
						],
					},
				});
				await tx.address.deleteMany({
					where: {
						id: {
							in: addressIds,
						},
					},
				});
				await tx.draft.deleteMany({
					where: {
						workspaceId: data.workspaceId,
					},
				});
				await tx.invitation.deleteMany({
					where: {
						workspaceId: data.workspaceId,
					},
				});
				await tx.notification.deleteMany({
					where: {
						memberId: {
							in: memberIds,
						},
					},
				});
				await tx.memberPermission.deleteMany({
					where: {
						memberId: {
							in: memberIds,
						},
					},
				});
				await tx.rolePermission.deleteMany({
					where: {
						roleId: {
							in: roleIds,
						},
					},
				});
				await tx.member.deleteMany({
					where: {
						workspaceId: data.workspaceId,
					},
				});
				await tx.role.deleteMany({
					where: {
						workspaceId: data.workspaceId,
					},
				});
				await tx.domain.deleteMany({
					where: {
						workspaceId: data.workspaceId,
					},
				});
				await tx.activity.deleteMany({
					where: {
						workspaceId: data.workspaceId,
					},
				});
				await tx.workspace.delete({
					where: {
						id: data.workspaceId,
					},
				});
			});
		} catch {
			return {
				error:
					"We could not delete this workspace right now. Please try again.",
				status: "error" as const,
			};
		}

		return {
			status: "success" as const,
		};
	});
