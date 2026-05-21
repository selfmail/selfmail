import { randomUUID } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { db } from "@selfmail/db";
import { hasAnyPermission, hasPermissions } from "@selfmail/permissions";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "#/utils/auth";
import { createAddressSlug } from "./address-slug";
import { defaultDomainId, defaultDomainSuffix } from "./constants";
import {
	detectDnsProvider,
	toDashboardWorkspaceDomain,
} from "./domain-presenter";
import { domainTxtHost, domainTxtValue } from "./domain-utils";
import { getUniqueErrorTarget } from "./errors";
import {
	createAddressSchema,
	createWorkspaceDomainSchema,
	removeWorkspaceMemberSchema,
	workspaceDomainSchema,
} from "./schemas";
import type {
	CreateWorkspaceAddressResult,
	DeleteWorkspaceDomainResult,
	RemoveWorkspaceMemberResult,
	WorkspaceDomainResult,
} from "./types";

async function getDomainWorkspaceMember(userId: string, workspaceSlug: string) {
	return db.member.findFirst({
		select: {
			id: true,
			workspace: {
				select: {
					id: true,
				},
			},
		},
		where: {
			userId,
			workspace: {
				slug: workspaceSlug,
			},
		},
	});
}

async function canManageDomain(
	memberId: string,
	workspaceId: string,
	permission: "domains:add" | "domains:delete",
) {
	return hasPermissions({
		memberId,
		permissions: [permission],
		workspaceId,
	});
}

async function canVerifyDomain(memberId: string, workspaceId: string) {
	return hasAnyPermission({
		memberId,
		permissions: ["domains:add", "domains:update"],
		workspaceId,
	});
}

export const createWorkspaceAddressFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createAddressSchema)
	.handler(
		async ({
			context: { user },
			data,
		}): Promise<CreateWorkspaceAddressResult> => {
			const handle = data.handle.toLowerCase();
			const member = await db.member.findFirst({
				select: {
					id: true,
					workspace: {
						select: {
							id: true,
							ownerId: true,
							slug: true,
						},
					},
				},
				where: {
					userId: user.id,
					workspace: {
						slug: data.workspaceSlug,
					},
				},
			});

			if (!member) {
				return {
					error: "Workspace not found.",
					status: "error",
				};
			}

			const customDomain =
				data.domainId && data.domainId !== defaultDomainId
					? await db.domain.findFirst({
							select: {
								domain: true,
								id: true,
							},
							where: {
								id: data.domainId,
								verified: true,
								workspaceId: member.workspace.id,
							},
						})
					: null;

			if (data.domainId && data.domainId !== defaultDomainId && !customDomain) {
				return {
					error: "Select a verified domain for this workspace.",
					status: "error",
				};
			}

			const domain =
				customDomain?.domain ??
				`${member.workspace.slug}.${defaultDomainSuffix}`;
			const email = `${handle}@${domain}`;

			for (let attempt = 0; attempt < 8; attempt += 1) {
				try {
					const addressSlug = createAddressSlug();
					const address = await db.$transaction(async (tx) => {
						const address = await tx.address.create({
							data: {
								addressSlug,
								domainId: customDomain?.id,
								email,
								handle,
							},
							select: {
								addressSlug: true,
								id: true,
							},
						});

						await tx.memberAddress.create({
							data: {
								addressId: address.id,
								memberId: member.id,
								role: user.id === member.workspace.ownerId ? "owner" : "member",
							},
						});

						return address;
					});

					return {
						addressSlug: address.addressSlug,
						status: "success",
					};
				} catch (error) {
					const target = getUniqueErrorTarget(error);

					if (target.has("addressSlug")) {
						continue;
					}

					if (target.has("email")) {
						return {
							error: "This email address is already taken.",
							status: "error",
						};
					}

					return {
						error:
							"We could not create this address right now. Please try again.",
						status: "error",
					};
				}
			}

			return {
				error:
					"We could not create a short address URL right now. Please try again.",
				status: "error",
			};
		},
	);

export const createWorkspaceDomainFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createWorkspaceDomainSchema)
	.handler(
		async ({
			context: { user },
			data: { domain, workspaceSlug },
		}): Promise<WorkspaceDomainResult> => {
			const member = await getDomainWorkspaceMember(user.id, workspaceSlug);

			if (!member) {
				return {
					error: "Workspace not found.",
					status: "error",
				};
			}

			if (
				!(await canManageDomain(member.id, member.workspace.id, "domains:add"))
			) {
				return {
					error: "You do not have permission to add domains.",
					status: "error",
				};
			}

			try {
				const createdDomain = await db.domain.create({
					data: {
						domain,
						verificationToken: randomUUID(),
						workspaceId: member.workspace.id,
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
				});

				return {
					domain: toDashboardWorkspaceDomain(
						createdDomain,
						await detectDnsProvider(createdDomain.domain),
					),
					status: "success",
				};
			} catch (error) {
				if (getUniqueErrorTarget(error).has("domain")) {
					return {
						error: "This domain is already connected.",
						status: "error",
					};
				}

				return {
					error: "We could not add this domain right now. Please try again.",
					status: "error",
				};
			}
		},
	);

export const verifyWorkspaceDomainFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(workspaceDomainSchema)
	.handler(
		async ({
			context: { user },
			data: { domainId, workspaceSlug },
		}): Promise<WorkspaceDomainResult> => {
			const member = await getDomainWorkspaceMember(user.id, workspaceSlug);

			if (!member) {
				return {
					error: "Workspace not found.",
					status: "error",
				};
			}

			if (!(await canVerifyDomain(member.id, member.workspace.id))) {
				return {
					error: "You do not have permission to verify domains.",
					status: "error",
				};
			}

			const domain = await db.domain.findFirst({
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
				where: {
					id: domainId,
					workspaceId: member.workspace.id,
				},
			});

			if (!domain) {
				return {
					error: "Domain not found.",
					status: "error",
				};
			}

			if (domain.verified) {
				return {
					domain: toDashboardWorkspaceDomain(
						domain,
						await detectDnsProvider(domain.domain),
					),
					status: "success",
				};
			}

			try {
				const records = await resolveTxt(domainTxtHost(domain.domain));
				const hasVerificationRecord = records
					.map((record) => record.join(""))
					.includes(domainTxtValue(domain.verificationToken));

				if (!hasVerificationRecord) {
					return {
						error: "The verification TXT record was not found yet.",
						status: "error",
					};
				}

				const verifiedDomain = await db.domain.update({
					data: {
						verified: true,
						verifiedAt: new Date(),
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
					where: {
						id: domain.id,
					},
				});

				return {
					domain: toDashboardWorkspaceDomain(
						verifiedDomain,
						await detectDnsProvider(verifiedDomain.domain),
					),
					status: "success",
				};
			} catch {
				return {
					error: "DNS records could not be checked yet.",
					status: "error",
				};
			}
		},
	);

export const deleteWorkspaceDomainFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(workspaceDomainSchema)
	.handler(
		async ({
			context: { user },
			data: { domainId, workspaceSlug },
		}): Promise<DeleteWorkspaceDomainResult> => {
			const member = await getDomainWorkspaceMember(user.id, workspaceSlug);

			if (!member) {
				return {
					error: "Workspace not found.",
					status: "error",
				};
			}

			if (
				!(await canManageDomain(
					member.id,
					member.workspace.id,
					"domains:delete",
				))
			) {
				return {
					error: "You do not have permission to delete domains.",
					status: "error",
				};
			}

			const domain = await db.domain.findFirst({
				select: {
					_count: {
						select: {
							addresses: true,
						},
					},
					id: true,
				},
				where: {
					id: domainId,
					workspaceId: member.workspace.id,
				},
			});

			if (!domain) {
				return {
					error: "Domain not found.",
					status: "error",
				};
			}

			if (domain._count.addresses > 0) {
				return {
					error: "Remove addresses on this domain before deleting it.",
					status: "error",
				};
			}

			await db.domain.delete({
				where: {
					id: domain.id,
				},
			});

			return {
				status: "success",
			};
		},
	);

export const removeWorkspaceMemberFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(removeWorkspaceMemberSchema)
	.handler(
		async ({
			context: { user },
			data: { memberId, workspaceSlug },
		}): Promise<RemoveWorkspaceMemberResult> => {
			const currentMember = await db.member.findFirst({
				select: {
					id: true,
					workspace: {
						select: {
							id: true,
							ownerId: true,
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
				return {
					error: "Workspace not found.",
					status: "error",
				};
			}

			if (currentMember.id === memberId) {
				return {
					error: "You cannot remove yourself from the workspace.",
					status: "error",
				};
			}

			const canRemoveMembers = await hasPermissions({
				memberId: currentMember.id,
				permissions: ["members:remove"],
				workspaceId: currentMember.workspace.id,
			});

			if (!canRemoveMembers) {
				return {
					error: "You do not have permission to remove workspace members.",
					status: "error",
				};
			}

			const member = await db.member.findFirst({
				select: {
					id: true,
					userId: true,
					workspaceId: true,
				},
				where: {
					id: memberId,
					workspaceId: currentMember.workspace.id,
				},
			});

			if (!member) {
				return {
					error: "Member not found.",
					status: "error",
				};
			}

			if (member.userId === currentMember.workspace.ownerId) {
				return {
					error: "The workspace owner cannot be removed.",
					status: "error",
				};
			}

			await db.$transaction(async (tx) => {
				// Member-related tables do not cascade in the Prisma schema, so the
				// dependent records are cleared before removing the member itself.
				await tx.invitation.deleteMany({
					where: {
						invitedById: member.id,
					},
				});
				await tx.notification.deleteMany({
					where: {
						memberId: member.id,
					},
				});
				await tx.draft.deleteMany({
					where: {
						memberId: member.id,
					},
				});
				await tx.smtpCredentials.deleteMany({
					where: {
						memberId: member.id,
					},
				});
				await tx.memberAddress.deleteMany({
					where: {
						memberId: member.id,
					},
				});
				await tx.memberPermission.deleteMany({
					where: {
						memberId: member.id,
					},
				});
				await tx.member.update({
					data: {
						roles: {
							set: [],
						},
					},
					where: {
						id: member.id,
					},
				});
				await tx.member.delete({
					where: {
						id: member.id,
					},
				});
			});

			return {
				status: "success",
			};
		},
	);
