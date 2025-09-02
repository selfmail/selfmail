import { Queue } from "bullmq";
import IORedis from "ioredis";
import type { ParsedMail } from "mailparser";

export abstract class EmailQueue {
	static connection = new IORedis({
		maxRetriesPerRequest: null,
		host: "127.0.0.1",
		port: 6379,
	});
	static queue = new Queue<ParsedMail>("emails-outbound", {
		connection: EmailQueue.connection,
		defaultJobOptions: {
			attempts: 5,
			backoff: {
				type: "exponential",
				delay: 1000,
			},
			removeOnComplete: true,
			removeOnFail: false,
		},
	});
	static async processOutbound(data: ParsedMail & { delay?: number }) {
		await EmailQueue.queue.add("emails-outbound", data, { delay: data.delay });
	}
}
