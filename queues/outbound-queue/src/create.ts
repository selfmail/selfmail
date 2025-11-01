import type { ConnectionOptions } from "bullmq";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { type OutboundEmail, outboundSchema } from "./schema/outbound";

const connection = new IORedis(
	process.env.REDIS_URL ?? "redis://localhost:6379",
	{
		maxRetriesPerRequest: null,
	},
);

const emailQueue = new Queue("emails-outbound", {
	connection: connection as unknown as ConnectionOptions,
});

export async function createEmail(emailData: OutboundEmail) {
	const { success, error, data } =
		await outboundSchema.safeParseAsync(emailData);

	if (!success || error || !data) {
		throw new Error(`Invalid email data: ${error?.message}`);
	}

	await emailQueue.add("process-email", data);
}
