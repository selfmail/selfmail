import { randomUUID } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { createAuditLog } from "@selfmail/audit";
import { db } from "@selfmail/db";
import { hasAnyPermission, hasPermissions } from "@selfmail/permissions";
import { createServerFn } from "@tanstack/react-start";
import { m } from "#/paraglide/messages";
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
	updateWorkspaceSettingsSchema,
	workspaceDomainSchema,
	workspaceSlugSchema,
} from "./schemas";
import type {
	CreateWorkspaceAddressResult,
	DeleteWorkspaceDomainResult,
	RemoveWorkspaceMemberResult,
	WorkspaceDomainResult,
	WorkspaceSettingsResult,
} from "./types";

function getDomainWorkspaceMember(userId: string, workspaceSlug: string) {
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

function canManageDomain(
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

function canVerifyDomain(memberId: string, workspaceId: string) {
	return hasAnyPermission({
		memberId,
		permissions: ["domains:add", "domains:update"],
		workspaceId,
	});
}

function getSettingsWorkspaceMember(userId: string, workspaceSlug: string) {
	return db.member.findFirst({
		select: {
			id: true,
			userId: true,
			workspace: {
				select: {
					createdAt: true,
					description: true,
					id: true,
					name: true,
					ownerId: true,
					slug: true,
					updatedAt: true,
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

export const updateWorkspaceSettingsFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(updateWorkspaceSettingsSchema)
	.handler(
		async ({ context: { user }, data }): Promise<WorkspaceSettingsResult> => {
			const member = await getSettingsWorkspaceMember(
				user.id,
				data.workspaceSlug,
			);

			if (!member) {
				return {
					error: m["dashboard.errors.workspace_not_found"](),
					status: "error",
				};
			}

			const canUpdateWorkspace = await hasPermissions({
				memberId: member.id,
				permissions: ["settings:update-workspace"],
				workspaceId: member.workspace.id,
			});

			if (!canUpdateWorkspace) {
				return {
					error: m["dashboard.errors.workspace_update_permission"](),
					status: "error",
				};
			}

			const workspace = await db.workspace.update({
				data: {
					description: data.description?.trim() || null,
					name: data.name.trim(),
				},
				select: {
					createdAt: true,
					description: true,
					id: true,
					name: true,
					ownerId: true,
					slug: true,
					updatedAt: true,
				},
				where: {
					id: member.workspace.id,
				},
			});

			return {
				status: "success",
				workspace: {
					createdAt: workspace.createdAt.toISOString(),
					defaultDomain: `${workspace.slug}.${defaultDomainSuffix}`,
					description: workspace.description,
					id: workspace.id,
					isOwner: member.userId === workspace.ownerId,
					name: workspace.name,
					slug: workspace.slug,
					updatedAt: workspace.updatedAt.toISOString(),
				},
			};
		},
	);

export const deleteWorkspaceFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(workspaceSlugSchema)
	.handler(
		async ({
			context: { user },
			data: { workspaceSlug },
		}): Promise<WorkspaceSettingsResult> => {
			const member = await getSettingsWorkspaceMember(user.id, workspaceSlug);

			if (!member) {
				return {
					error: m["dashboard.errors.workspace_not_found"](),
					status: "error",
				};
			}

			const canDeleteWorkspace = await hasPermissions({
				memberId: member.id,
				permissions: ["settings:delete"],
				workspaceId: member.workspace.id,
			});

			if (!canDeleteWorkspace) {
				return {
					error: m["dashboard.errors.workspace_delete_permission"](),
					status: "error",
				};
			}

			await db.$transaction(async (tx) => {
				const members = await tx.member.findMany({
					select: {
						id: true,
					},
					where: {
						workspaceId: member.workspace.id,
					},
				});
				const addressLinks = await tx.memberAddress.findMany({
					select: {
						addressId: true,
					},
					where: {
						member: {
							workspaceId: member.workspace.id,
						},
					},
				});
				const domainAddresses = await tx.address.findMany({
					select: {
						id: true,
					},
					where: {
						Domain: {
							workspaceId: member.workspace.id,
						},
					},
				});
				const domains = await tx.domain.findMany({
					select: {
						id: true,
					},
					where: {
						workspaceId: member.workspace.id,
					},
				});
				const addressIds = [
					...new Set([
						...addressLinks.map(({ addressId }) => addressId),
						...domainAddresses.map(({ id }) => id),
					]),
				];

				await Promise.all([
					...addressIds.map((id) =>
						createAuditLog(
							{
								action: "mailbox.deleted",
								actor: {
									email: user.email,
									id: user.id,
									type: "user",
								},
								metadata: {
									reason: "workspace_deleted",
								},
								target: {
									id,
									type: "mailbox",
								},
								tenantId: member.workspace.id,
							},
							tx,
						),
					),
					...domains.map(({ id }) =>
						createAuditLog(
							{
								action: "domain.deleted",
								actor: {
									email: user.email,
									id: user.id,
									type: "user",
								},
								metadata: {
									reason: "workspace_deleted",
								},
								target: {
									id,
									type: "domain",
								},
								tenantId: member.workspace.id,
							},
							tx,
						),
					),
				]);

				if (addressIds.length) {
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
							addressId: {
								in: addressIds,
							},
						},
					});
				}

				await tx.smtpCredentials.deleteMany({
					where: {
						workspaceId: member.workspace.id,
					},
				});
				await tx.notification.deleteMany({
					where: {
						member: {
							workspaceId: member.workspace.id,
						},
					},
				});
				await tx.draft.deleteMany({
					where: {
						workspaceId: member.workspace.id,
					},
				});
				await tx.invitation.deleteMany({
					where: {
						workspaceId: member.workspace.id,
					},
				});
				await tx.memberAddress.deleteMany({
					where: {
						member: {
							workspaceId: member.workspace.id,
						},
					},
				});

				if (addressIds.length) {
					await tx.address.deleteMany({
						where: {
							id: {
								in: addressIds,
							},
						},
					});
				}

				await tx.domain.deleteMany({
					where: {
						workspaceId: member.workspace.id,
					},
				});
				await tx.memberPermission.deleteMany({
					where: {
						member: {
							workspaceId: member.workspace.id,
						},
					},
				});

				for (const workspaceMember of members) {
					await tx.member.update({
						data: {
							roles: {
								set: [],
							},
						},
						where: {
							id: workspaceMember.id,
						},
					});
				}

				await tx.rolePermission.deleteMany({
					where: {
						role: {
							workspaceId: member.workspace.id,
						},
					},
				});
				await tx.role.deleteMany({
					where: {
						workspaceId: member.workspace.id,
					},
				});
				await tx.member.deleteMany({
					where: {
						workspaceId: member.workspace.id,
					},
				});
				await tx.activity.deleteMany({
					where: {
						workspaceId: member.workspace.id,
					},
				});
				await tx.billingEntitlement.deleteMany({
					where: {
						workspaceId: member.workspace.id,
					},
				});
				await tx.billingCheckout.deleteMany({
					where: {
						workspaceId: member.workspace.id,
					},
				});
				await tx.billingSubscription.deleteMany({
					where: {
						workspaceId: member.workspace.id,
					},
				});
				await tx.billingCustomer.deleteMany({
					where: {
						workspaceId: member.workspace.id,
					},
				});
				await tx.billingWebhookEvent.deleteMany({
					where: {
						workspaceId: member.workspace.id,
					},
				});
				await tx.workspace.delete({
					where: {
						id: member.workspace.id,
					},
				});
			});

			return {
				status: "success",
				workspace: {
					createdAt: member.workspace.createdAt.toISOString(),
					defaultDomain: `${member.workspace.slug}.${defaultDomainSuffix}`,
					description: member.workspace.description,
					id: member.workspace.id,
					isOwner: member.userId === member.workspace.ownerId,
					name: member.workspace.name,
					slug: member.workspace.slug,
					updatedAt: member.workspace.updatedAt.toISOString(),
				},
			};
		},
	);

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
					error: m["dashboard.errors.workspace_not_found"](),
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
					error: m["dashboard.errors.address_domain_required"](),
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

						await createAuditLog(
							{
								action: "mailbox.created",
								actor: {
									email: user.email,
									id: user.id,
									type: "user",
								},
								target: {
									id: address.id,
									type: "mailbox",
								},
								tenantId: member.workspace.id,
							},
							tx,
						);

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
							error: m["dashboard.errors.email_taken"](),
							status: "error",
						};
					}

					return {
						error: m["dashboard.errors.address_create_failed"](),
						status: "error",
					};
				}
			}

			return {
				error: m["dashboard.errors.short_address_failed"](),
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
					error: m["dashboard.errors.workspace_not_found"](),
					status: "error",
				};
			}

			if (
				!(await canManageDomain(member.id, member.workspace.id, "domains:add"))
			) {
				return {
					error: m["dashboard.errors.domain_add_permission"](),
					status: "error",
				};
			}

			try {
				const createdDomain = await db.$transaction(async (tx) => {
					const createdDomain = await tx.domain.create({
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

					await createAuditLog(
						{
							action: "domain.created",
							actor: {
								email: user.email,
								id: user.id,
								type: "user",
							},
							metadata: {
								domain: createdDomain.domain,
							},
							target: {
								id: createdDomain.id,
								type: "domain",
							},
							tenantId: member.workspace.id,
						},
						tx,
					);

					return createdDomain;
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
						error: m["dashboard.errors.domain_taken"](),
						status: "error",
					};
				}

				return {
					error: m["dashboard.errors.domain_add_failed"](),
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
					error: m["dashboard.errors.workspace_not_found"](),
					status: "error",
				};
			}

			if (!(await canVerifyDomain(member.id, member.workspace.id))) {
				return {
					error: m["dashboard.errors.domain_verify_permission"](),
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
					error: m["dashboard.errors.domain_not_found"](),
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

			let records: string[][];

			try {
				records = await resolveTxt(domainTxtHost(domain.domain));
			} catch {
				await createAuditLog({
					action: "domain.dns_check_failed",
					actor: {
						email: user.email,
						id: user.id,
						type: "user",
					},
					metadata: {
						domain: domain.domain,
						reason: "dns_lookup_failed",
					},
					target: {
						id: domain.id,
						type: "domain",
					},
					tenantId: member.workspace.id,
				});

				return {
					error: m["dashboard.errors.dns_check_failed"](),
					status: "error",
				};
			}

			const hasVerificationRecord = records
				.map((record) => record.join(""))
				.includes(domainTxtValue(domain.verificationToken));

			if (!hasVerificationRecord) {
				await createAuditLog({
					action: "domain.dns_check_failed",
					actor: {
						email: user.email,
						id: user.id,
						type: "user",
					},
					metadata: {
						domain: domain.domain,
						reason: "verification_record_missing",
					},
					target: {
						id: domain.id,
						type: "domain",
					},
					tenantId: member.workspace.id,
				});

				return {
					error: m["dashboard.errors.verification_txt_missing"](),
					status: "error",
				};
			}

			const verifiedDomain = await db.$transaction(async (tx) => {
				const verifiedDomain = await tx.domain.update({
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

				await createAuditLog(
					{
						action: "domain.verified",
						actor: {
							email: user.email,
							id: user.id,
							type: "user",
						},
						metadata: {
							domain: verifiedDomain.domain,
							method: "dns_txt",
						},
						target: {
							id: verifiedDomain.id,
							type: "domain",
						},
						tenantId: member.workspace.id,
					},
					tx,
				);

				return verifiedDomain;
			});

			return {
				domain: toDashboardWorkspaceDomain(
					verifiedDomain,
					await detectDnsProvider(verifiedDomain.domain),
				),
				status: "success",
			};
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
					error: m["dashboard.errors.workspace_not_found"](),
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
					error: m["dashboard.errors.domain_delete_permission"](),
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
					error: m["dashboard.errors.domain_not_found"](),
					status: "error",
				};
			}

			if (domain._count.addresses > 0) {
				return {
					error: m["dashboard.errors.domain_delete_addresses"](),
					status: "error",
				};
			}

			await db.$transaction(async (tx) => {
				await tx.domain.delete({
					where: {
						id: domain.id,
					},
				});

				await createAuditLog(
					{
						action: "domain.deleted",
						actor: {
							email: user.email,
							id: user.id,
							type: "user",
						},
						target: {
							id: domain.id,
							type: "domain",
						},
						tenantId: member.workspace.id,
					},
					tx,
				);
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
					error: m["dashboard.errors.workspace_not_found"](),
					status: "error",
				};
			}

			if (currentMember.id === memberId) {
				return {
					error: m["dashboard.errors.remove_self"](),
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
					error: m["dashboard.errors.member_remove_permission"](),
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
					error: m["dashboard.errors.member_not_found"](),
					status: "error",
				};
			}

			if (member.userId === currentMember.workspace.ownerId) {
				return {
					error: m["dashboard.errors.owner_remove_denied"](),
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
