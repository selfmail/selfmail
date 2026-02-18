import z from "zod";
import { emailQueue } from ".";

const emailAddressSchema = z.object({
	name: z.string().optional(),
	address: z.string().email(),
});

const schema = z.object({
	messageId: z.string().optional(),
	subject: z.string(),
	date: z.date().optional(),
	sizeBytes: z.bigint(),
	from: z.array(emailAddressSchema),
	to: z.array(emailAddressSchema),
	cc: z.array(emailAddressSchema).optional(),
	bcc: z.array(emailAddressSchema).optional(),
	replyTo: z.array(emailAddressSchema).optional(),
	text: z.string().optional(),
	html: z.string().optional(),
	headers: z.record(z.string(), z.unknown()).optional(),
	attachments: z.array(z.record(z.string(), z.unknown())).optional(),
	warning: z.string().optional(),
	spamScore: z.number().optional(),
	virusStatus: z.string().optional(),
	rawEmail: z.string().optional(),
	addressId: z.string().uuid(),
	contactId: z.string().uuid().optional(),
	sort: z.enum(["normal", "important", "spam", "trash", "sent"]),
});

export async function saveEmail(emailData: z.infer<typeof schema>) {
	const { success, error, data } = await schema.safeParseAsync(emailData);

	if (!success || error || !data) {
		throw new Error(`Invalid email data: ${error?.message}`);
	}

	await emailQueue.add("process-email", data);
}
