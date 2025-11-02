export namespace EmailWSModule {
	export type EmailJobData = {
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
}
