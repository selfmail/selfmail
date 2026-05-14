import z from "zod";

export const workspaceSettingsSchema = z.object({
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

export const workspaceDeleteSchema = z.object({
	workspaceId: z.string().min(1),
});

export const workspaceSlugSchema = z.object({
	workspaceSlug: z.string().min(1),
});

export const createAddressSchema = workspaceSlugSchema.extend({
	domainId: z.string().min(1).optional(),
	handle: z
		.string()
		.trim()
		.min(1, "Address is required.")
		.max(64, "Address is too long.")
		.regex(
			/^[a-z0-9]+(?:[._-]?[a-z0-9]+)*$/,
			"Use letters, numbers, dots, underscores, or hyphens.",
		),
});

export const addressInboxSchema = workspaceSlugSchema.extend({
	addressSlug: z.string().min(1),
});
