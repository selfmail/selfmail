import { Queue, Worker } from "bullmq";
import { db } from "database";
import { connection } from "./connection";

type EmailJobData = {
	messageId?: string;
	subject: string;
	date?: Date;
	sizeBytes: bigint;
	from: Array<{ name?: string; address: string }>;
	to: Array<{ name?: string; address: string }>;
	cc?: Array<{ name?: string; address: string }>;
	bcc?: Array<{ name?: string; address: string }>;
	replyTo?: Array<{ name?: string; address: string }>;
	text?: string;
	html?: string;
	headers?: Record<string, unknown>;
	attachments?: Array<Record<string, unknown>>;
	warning?: string;
	spamScore?: number;
	virusStatus?: string;
	rawEmail?: string;
	addressId: string;
	contactId?: string;
	sort: "normal" | "important" | "spam" | "trash" | "sent";
};

export const emailWorker = new Worker<EmailJobData>(
	"email",
	async (job) => {
		const data = job.data;

		try {
			await db.email.create({
				data: {
					messageId: data.messageId,
					subject: data.subject,
					date: data.date ?? new Date(),
					sizeBytes: data.sizeBytes,
					from: data.from as never,
					to: data.to as never,
					cc: data.cc ? (data.cc as never) : undefined,
					bcc: data.bcc ? (data.bcc as never) : undefined,
					replyTo: data.replyTo ? (data.replyTo as never) : undefined,
					text: data.text,
					html: data.html,
					headers: data.headers ? (data.headers as never) : undefined,
					attachments: data.attachments
						? (data.attachments as never)
						: undefined,
					warning: data.warning,
					spamScore: data.spamScore,
					virusStatus: data.virusStatus,
					rawEmail: data.rawEmail,
					addressId: data.addressId,
					contactId: data.contactId,
					sort: data.sort,
					processed: true,
				},
			});

			console.log(`[EmailWorker] Successfully saved email: ${data.subject}`);
		} catch (error) {
			console.error(
				`[EmailWorker] Error saving email: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			throw error;
		}
	},
	// biome-ignore lint/suspicious/noExplicitAny: ioredis version mismatch between bullmq dependencies
	{ connection } as any,
);

emailWorker.on("completed", async (job) => {
	const queue = new Queue("real-time-emails");

	await queue.add("email", job.data);
});

emailWorker.on("failed", (job, err) => {
	console.error(`[EmailWorker] Job ${job?.id} failed: ${err.message}`);
});
