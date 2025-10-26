import { Worker } from "bullmq";
import consola from "consola";
import { Logs } from "services/logs";
import { connection } from "./config/connection";
import { outbound } from "./outbound";
import type { OutboundEmail } from "./schema/outbound";

const retryDelays = [
	0,
	10 * 60 * 1000, // 10 min
	2 * 60 * 60 * 1000, // 2 h
	8 * 60 * 60 * 1000, // 8 h
	24 * 60 * 60 * 1000, // 1 day
	3 * 24 * 60 * 60 * 1000, // 3 days
	5 * 24 * 60 * 60 * 1000, // 5 days (last attempt)
];

const outboundWorker = new Worker<OutboundEmail, void>(
	"emails-outbound",
	async (job) => await outbound(job),
	{
		connection,
		concurrency: 5,
		settings: {
			backoffStrategy: (attemptsMade: number) => {
				const idx = Math.min(Math.max(0, attemptsMade), retryDelays.length - 1);
				return retryDelays[idx] ?? 0;
			},
		},
	},
);

outboundWorker.on("error", (err) => {
	consola.error("Worker error", err);
});

outboundWorker.on("closed", () => {
	consola.info("Worker closed");
});

outboundWorker.on(
	"failed",
	async (job, err: Error & { failedReason?: string }) => {
		console.log(JSON.stringify(err));
		consola.warn(`Job ${job?.id} failed: ${err?.message}`);
		await Logs.error("Outbound job failed", {
			jobId: job?.id,
			queue: job?.queueName,
			name: job?.name,
			attemptsMade: job?.attemptsMade,
			failedReason: err?.failedReason,
			stack: err?.stack,
			data: job?.data,
		});
	},
);

outboundWorker.on("completed", (job) => {
	consola.log(`Job ${job.id} completed`);
});
