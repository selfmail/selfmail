import { createAuditLog } from "@selfmail/audit";
import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { m } from "#/paraglide/messages";
import { authMiddleware } from "#/utils/auth";

const defaultDomainSuffix = "selfmail.app";
const localPartPattern = /^[a-z0-9]+(?:[._-]?[a-z0-9]+)*$/;
const addressSlugAlphabet = "abcdefghijklmnopqrstuvwxyz";
const workspaceSlugAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
const workspaceSlugLength = 7;
const maximumCreationAttempts = 8;

const onboardingSchema = z.object({
	defaultAddress: z
		.string()
		.trim()
		.min(1, m["onboarding.errors.address_required"]())
		.max(64, m["onboarding.errors.address_too_long"]())
		.regex(localPartPattern, m["dashboard.validation.address_format"]()),
	workspaceName: z
		.string()
		.trim()
		.min(1, m["onboarding.errors.workspace_name_required"]())
		.max(120, m["onboarding.errors.workspace_name_too_long"]()),
});

export type CreateOnboardingResult =
	| {
			status: "error";
			error: {
				code: "ADDRESS_TAKEN" | "UNKNOWN_ERROR";
				message: string;
			};
	  }
	| {
			status: "success";
			workspaceId: string;
	  };

function createAddressSlug() {
	return Array.from({ length: 5 }, () =>
		addressSlugAlphabet.charAt(
			Math.floor(Math.random() * addressSlugAlphabet.length),
		),
	).join("");
}

function createWorkspaceSlug() {
	return Array.from({ length: workspaceSlugLength }, () =>
		workspaceSlugAlphabet.charAt(
			Math.floor(Math.random() * workspaceSlugAlphabet.length),
		),
	).join("");
}

export const createOnboardingWorkspaceFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(onboardingSchema)
	.handler(
		async ({ context: { user }, data }): Promise<CreateOnboardingResult> => {
			const addressHandle = data.defaultAddress.toLowerCase();

			for (let attempt = 0; attempt < maximumCreationAttempts; attempt += 1) {
				try {
					const addressSlug = createAddressSlug();
					const workspaceSlug = createWorkspaceSlug();
					const email = `${addressHandle}@${workspaceSlug}.${defaultDomainSuffix}`;
					const workspace = await db.$transaction(async (tx) => {
						const workspace = await tx.workspace.create({
							data: {
								name: data.workspaceName,
								ownerId: user.id,
								slug: workspaceSlug,
							},
							select: {
								id: true,
							},
						});

						const [member, address] = await Promise.all([
							tx.member.create({
								data: {
									profileName: user.name || user.email,
									userId: user.id,
									workspaceId: workspace.id,
								},
								select: {
									id: true,
								},
							}),
							tx.address.create({
								data: {
									addressSlug,
									email,
									handle: addressHandle,
								},
								select: {
									id: true,
								},
							}),
						]);

						await tx.memberAddress.create({
							data: {
								addressId: address.id,
								memberId: member.id,
								role: "owner",
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
								tenantId: workspace.id,
							},
							tx,
						);

						return workspace;
					});

					return {
						status: "success",
						workspaceId: workspace.id,
					};
				} catch (error) {
					const targetValue =
						error instanceof Error && "meta" in error
							? (error.meta as { target?: string | string[] } | undefined)
									?.target
							: undefined;
					const target = new Set(
						Array.isArray(targetValue) ? targetValue : [targetValue],
					);

					if (target.has("addressSlug") || target.has("slug")) {
						continue;
					}

					if (target.has("email")) {
						return {
							status: "error",
							error: {
								code: "ADDRESS_TAKEN",
								message: m["onboarding.errors.address_taken"](),
							},
						};
					}

					return {
						status: "error",
						error: {
							code: "UNKNOWN_ERROR",
							message: m["onboarding.errors.create_workspace_failed"](),
						},
					};
				}
			}

			return {
				status: "error",
				error: {
					code: "UNKNOWN_ERROR",
					message: m["onboarding.errors.create_workspace_failed"](),
				},
			};
		},
	);
