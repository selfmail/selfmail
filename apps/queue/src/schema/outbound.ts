import z from "zod";

export const outboundSchema = z.object({
	subject: z.string().min(1),
	to: z.email(),
	body: z.string().min(1),
	from: z.email(),
	html: z.string(),
	attachments: z.array(z.file()),
});
