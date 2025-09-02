import { Queue, Worker } from "bullmq";
import consola from "consola";
import IORedis from "ioredis";
import { outbound } from "./outbound";
import type { OutboundEmail } from "./schema/outbound";

const connection = new IORedis({
	maxRetriesPerRequest: null,
	host: "127.0.0.1",
	port: 6379,
});

const outboundWorker = new Worker<OutboundEmail, void>(
	"emails-outbound",
	async (job) => await outbound(job),
	{ connection, concurrency: 50 },
);

outboundWorker.on("completed", (job) => {
	consola.success(`Job ${job.id} completed`);
});

outboundWorker.on("failed", (job, err) => {
	consola.error(
		`Job ${job?.id} failed after attempt ${job?.attemptsMade}:`,
		err,
	);
});
