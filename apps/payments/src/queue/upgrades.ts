import type { Job } from "bullmq";

export interface UpgradeJobData {
	workspaceId: string;
}

export async function upgrade(job: Job<UpgradeJobData, void, string>) {}
