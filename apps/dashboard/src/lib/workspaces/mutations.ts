import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "#/utils/auth";
import { createAddressSlug } from "./address-slug";
import { defaultDomainId, defaultDomainSuffix } from "./constants";
import { getUniqueErrorTarget } from "./errors";
import { createAddressSchema } from "./schemas";
import type { CreateWorkspaceAddressResult } from "./types";

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
