import z from "zod";

export const outboundSchema = z.object({
	to: z.email().optional(),
	from: z.email().endsWith("@transaction.selfmail.app"),

	subject: z.string().min(1).max(998),
	text: z.string().min(1).max(10000).optional(),
	html: z.string().min(1).max(10000).optional(),

	attachments: z
		.array(
			z.object({
				filename: z.string().min(1).max(255),
				contentType: z.string().min(1).max(255),
				content: z
					.string()
					.min(1)
					.max(5 * 1024 * 1024), // max 5MB per attachment
			}),
		)
		.max(10) // max 10 attachments
		.optional(),
});

export type OutboundEmail = z.infer<typeof outboundSchema>;
