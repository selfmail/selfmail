import { Queue } from "bullmq";
import IORedis from "ioredis";
import type { OutboundEmail } from "../../../apps/queue/src/schema/outbound";

export abstract class EmailQueue {
	static connection = new IORedis(
		process.env.REDIS_OUTBOUND_QUEUE ||
			process.env.REDIS_URL ||
			"redis://localhost:6379",
		{
			maxRetriesPerRequest: null,
		},
	);

	static queue = new Queue<OutboundEmail>("emails-outbound", {
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

	static async processOutbound(data: OutboundEmail & { delay?: number }) {
		await EmailQueue.queue.add("emails-outbound", data, {
			delay: data.delay,
		});
	}
}
