import { Worker } from "bullmq";
import consola from "consola";
import { connection } from "./config/connection";
import { transactionalOutbound } from "./outbound";
import type { OutboundEmail } from "./schema/outbound";

const retryDelays = [
	0,
	10 * 60 * 1000,      // 10 min
	2 * 60 * 60 * 1000,  // 2 h
	8 * 60 * 60 * 1000,  // 8 h
	24 * 60 * 60 * 1000, // 1 day
	3 * 24 * 60 * 60 * 1000, // 3 days
	5 * 24 * 60 * 60 * 1000, // 5 days (last attempt)
];

const transactionalWorker = new Worker<OutboundEmail, void>(
	"emails-outbound",
	async (job) => await transactionalOutbound(job),
	{
		connection,
		limiter: {
			max: 10,
			duration: 1000 // 10 per second
		},
		concurrency: 5,
		settings: {
			backoffStrategy: (attemptsMade: number) => {
				const idx = Math.min(Math.max(0, attemptsMade), retryDelays.length - 1);
				return retryDelays[idx] ?? 0;
			},
		},
	}
);

transactionalWorker.on("failed", async (job, err: Error & { failedReason?: string }) => {
	consola.warn(`Transactional job ${job?.id} failed: ${err?.message}`);
});

transactionalWorker.on("completed", job => {
	consola.log(`Transactional job ${job.id} completed`);
});
