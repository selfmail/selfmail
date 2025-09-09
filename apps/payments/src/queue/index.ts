import { Worker } from "bullmq";
import { type DowngradeJobData, downgrade } from "./downgrade";
import { connection } from "./redis";

const downgradeWorker = new Worker<DowngradeJobData, void>(
	"emails-outbound",
	async (job) => await downgrade(job),
	{ connection, concurrency: 50 },
);

const upgradeWorker = new Worker<DowngradeJobData, void>(
	"emails-inbound",
	async (job) => await downgrade(job),
	{ connection, concurrency: 50 },
);
