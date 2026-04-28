export interface EmailJobData {
  messageId?: string;
  subject: string;
  date?: Date;
  sizeBytes: bigint;
  from: { name?: string; address: string }[];
  to: { name?: string; address: string }[];
  cc?: { name?: string; address: string }[];
  bcc?: { name?: string; address: string }[];
  replyTo?: { name?: string; address: string }[];
  text?: string;
  html?: string;
  headers?: Record<string, unknown>;
  attachments?: Record<string, unknown>[];
  warning?: string;
  spamScore?: number;
  virusStatus?: string;
  rawEmail?: string;
  addressId: string;
  contactId?: string;
  sort: "normal" | "important" | "spam" | "trash" | "sent";
}
