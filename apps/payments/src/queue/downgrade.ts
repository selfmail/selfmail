import type { Job } from "bullmq";

export interface DowngradeJobData {
	workspaceId: string;
}

export async function downgrade(job: Job<DowngradeJobData, void, string>) {}
