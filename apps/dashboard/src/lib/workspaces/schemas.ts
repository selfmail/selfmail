import z from "zod";

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
