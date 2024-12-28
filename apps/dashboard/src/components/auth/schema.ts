import { generateId } from "better-auth";
import { z } from "zod";

export const organizationSchema = z.object({
	id: z.string().default(generateId),
	name: z.string(),
	slug: z.string(),
	logo: z.string().nullish(),
	metadata: z
		.record(z.string())
		.or(z.string().transform((v) => JSON.parse(v)))
		.nullish(),
	createdAt: z.date(),
});

export const memberSchema = z.object({
	id: z.string().default(generateId),
	organizationId: z.string(),
	userId: z.string(),
	role: z.string(),
	createdAt: z.date(),
});

export const invitationSchema = z.object({
	id: z.string().default(generateId),
	organizationId: z.string(),
	email: z.string(),
	role: z.string(),
	status: z
		.enum(["pending", "accepted", "rejected", "canceled"])
		.default("pending"),
	/**
	 * The id of the user who invited the user.
	 */
	inviterId: z.string(),
	expiresAt: z.date(),
});

export type Organization = z.infer<typeof organizationSchema>;
export type Member = z.infer<typeof memberSchema>;
export type Invitation = z.infer<typeof invitationSchema>;
