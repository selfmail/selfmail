import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "#/utils/auth";

const defaultDomainSuffix = "selfmail.app";
const handlePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const localPartPattern = /^[a-z0-9]+(?:[._-]?[a-z0-9]+)*$/;
const addressSlugAlphabet = "abcdefghijklmnopqrstuvwxyz";

const onboardingSchema = z.object({
	defaultAddress: z
		.string()
		.trim()
		.min(1, "Address is required")
		.max(64, "Address is too long")
		.regex(
			localPartPattern,
			"Use letters, numbers, dots, underscores, or hyphens.",
		),
	workspaceHandle: z
		.string()
		.trim()
		.min(1, "Workspace handle is required")
		.max(63, "Workspace handle is too long")
		.regex(
			handlePattern,
			"Use lowercase letters, numbers, and single hyphens.",
		),
	workspaceName: z
		.string()
		.trim()
		.min(1, "Workspace name is required")
		.max(120, "Workspace name is too long"),
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

						const member = await tx.member.create({
							data: {
								profileName: user.name || user.email,
								userId: user.id,
								workspaceId: workspace.id,
							},
							select: {
								id: true,
							},
						});

						const address = await tx.address.create({
							data: {
								addressSlug,
								email,
								handle: addressHandle,
							},
							select: {
								id: true,
							},
						});

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
					const target = Array.isArray(targetValue)
						? targetValue
						: [targetValue];

					if (target?.includes("addressSlug")) {
						continue;
					}

					if (target?.includes("slug")) {
						return {
							status: "error",
							error: {
								code: "WORKSPACE_TAKEN",
								message: "This workspace handle is already taken.",
							},
						};
					}

					if (target?.includes("email")) {
						return {
							status: "error",
							error: {
								code: "ADDRESS_TAKEN",
								message: "This email address is already taken.",
							},
						};
					}

					return {
						status: "error",
						error: {
							code: "UNKNOWN_ERROR",
							message:
								"We could not create your workspace right now. Please try again.",
						},
					};
				}
			}

			return {
				status: "error",
				error: {
					code: "UNKNOWN_ERROR",
					message:
						"We could not create a short address URL right now. Please try again.",
				},
			};
		},
	);
