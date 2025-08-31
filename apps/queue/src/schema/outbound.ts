import z from "zod";

// Address object schema matching mailparser's AddressObject
const addressObjectSchema = z.object({
	value: z.array(
		z.object({
			address: z.string().email(),
			name: z.string().optional(),
		}),
	),
	text: z.string(),
	html: z.string(),
});

// Attachment schema matching mailparser's Attachment
const attachmentSchema = z.object({
	filename: z.string().optional(),
	contentType: z.string().optional(),
	size: z.number().optional(),
	content: z.instanceof(Buffer).optional(),
	cid: z.string().optional(),
	contentId: z.string().optional(),
	checksum: z.string().optional(),
	related: z.boolean().optional(),
});

// Header value can be string, string array, or Date
const headerValueSchema = z.union([z.string(), z.array(z.string()), z.date()]);

export const outboundSchema = z.object({
	// Required fields
	subject: z.string().optional(),
	text: z.string().optional(),
	html: z.union([z.string(), z.literal(false)]).optional(),

	// Address fields
	to: z.union([addressObjectSchema, z.array(addressObjectSchema)]).optional(),
	from: addressObjectSchema.optional(),
	cc: z.union([addressObjectSchema, z.array(addressObjectSchema)]).optional(),
	bcc: z.union([addressObjectSchema, z.array(addressObjectSchema)]).optional(),
	replyTo: addressObjectSchema.optional(),

	// Message identification
	messageId: z.string().optional(),
	inReplyTo: z.string().optional(),
	references: z.union([z.string(), z.array(z.string())]).optional(),

	// Date and priority
	date: z.string().optional(),
	priority: z.enum(["normal", "low", "high"]).optional(),

	// Content formatting
	textAsHtml: z.string().optional(),

	// Attachments and headers
	attachments: z.array(attachmentSchema),
	headers: z.union([z.map(z.string(), headerValueSchema), z.object()]),
	headerLines: z.array(
		z.object({
			key: z.string(),
			line: z.string(),
		}),
	),
});

export type OutboundEmail = z.infer<typeof outboundSchema>;
