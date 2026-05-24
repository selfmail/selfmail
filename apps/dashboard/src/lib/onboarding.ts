import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { m } from "#/paraglide/messages";
import { authMiddleware } from "#/utils/auth";

const defaultDomainSuffix = "selfmail.app";
const handlePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const localPartPattern = /^[a-z0-9]+(?:[._-]?[a-z0-9]+)*$/;
const addressSlugAlphabet = "abcdefghijklmnopqrstuvwxyz";

const onboardingSchema = z.object({
	defaultAddress: z
		.string()
		.trim()
		.min(1, m["onboarding.errors.address_required"]())
		.max(64, m["onboarding.errors.address_too_long"]())
		.regex(localPartPattern, m["dashboard.validation.address_format"]()),
	workspaceHandle: z
		.string()
		.trim()
		.min(1, m["onboarding.errors.workspace_handle_required"]())
		.max(63, m["onboarding.errors.workspace_handle_too_long"]())
		.regex(handlePattern, m["onboarding.errors.workspace_handle"]()),
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
				code: "ADDRESS_TAKEN" | "UNKNOWN_ERROR" | "WORKSPACE_TAKEN";
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

export const createOnboardingWorkspaceFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(onboardingSchema)
	.handler(
		async ({ context: { user }, data }): Promise<CreateOnboardingResult> => {
			const workspaceHandle = data.workspaceHandle.toLowerCase();
			const addressHandle = data.defaultAddress.toLowerCase();
			const email = `${addressHandle}@${workspaceHandle}.${defaultDomainSuffix}`;

			for (let attempt = 0; attempt < 8; attempt += 1) {
				try {
					const addressSlug = createAddressSlug();
					const workspace = await db.$transaction(async (tx) => {
						const workspace = await tx.workspace.create({
							data: {
								name: data.workspaceName,
								ownerId: user.id,
								slug: workspaceHandle,
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

					if (target.has("addressSlug")) {
						continue;
					}

					if (target.has("slug")) {
						return {
							status: "error",
							error: {
								code: "WORKSPACE_TAKEN",
								message: m["onboarding.errors.workspace_taken"](),
							},
						};
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
					message: m["onboarding.errors.short_address_failed"](),
				},
			};
		},
	);
