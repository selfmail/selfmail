import { Worker } from "bullmq";
import { type DowngradeJobData, downgrade } from "./downgrade";
import { connection } from "./redis";
import { type UpgradeJobData, upgrade } from "./upgrades";

const downgradeWorker = new Worker<DowngradeJobData, void>(
	"emails-outbound",
	async (job) => await downgrade(job),
	{ connection, concurrency: 50 },
);

const upgradeWorker = new Worker<UpgradeJobData, void>(
	"emails-inbound",
	async (job) => await upgrade(job),
	{ connection, concurrency: 50 },
);
