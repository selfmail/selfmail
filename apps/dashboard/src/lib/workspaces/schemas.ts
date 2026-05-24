import z from "zod";
import { m } from "#/paraglide/messages";
import { domainNameSchema } from "./domain-utils";

export const workspaceSlugSchema = z.object({
	workspaceSlug: z.string().min(1),
});

export const createAddressSchema = workspaceSlugSchema.extend({
	domainId: z.string().min(1).optional(),
	handle: z
		.string()
		.trim()
		.min(1, m["dashboard.validation.address_required"]())
		.max(64, m["dashboard.validation.address_too_long"]())
		.regex(
			/^[a-z0-9]+(?:[._-]?[a-z0-9]+)*$/,
			m["dashboard.validation.address_format"](),
		),
});

export const addressInboxSchema = workspaceSlugSchema.extend({
	addressSlug: z.string().min(1),
});

export const removeWorkspaceMemberSchema = workspaceSlugSchema.extend({
	memberId: z.string().min(1),
});

export const createWorkspaceDomainSchema = workspaceSlugSchema.extend({
	domain: domainNameSchema,
});

export const workspaceDomainSchema = workspaceSlugSchema.extend({
	domainId: z.string().min(1),
});

export const updateWorkspaceSettingsSchema = workspaceSlugSchema.extend({
	description: z
		.string()
		.trim()
		.max(280, m["dashboard.validation.description_too_long"]())
		.optional(),
	name: z
		.string()
		.trim()
		.min(1, m["dashboard.validation.workspace_name_required"]())
		.max(80, m["dashboard.validation.workspace_name_too_long"]()),
});
