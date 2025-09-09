import type { Job } from "bullmq";
import { db } from "database";

export interface DowngradeJobData {
	workspaceId: string;
	plan: "free" | "pro" | "premium";

	reason?: string;
	note?: string;

	downgradeAt: Date;
}

export async function downgrade(job: Job<DowngradeJobData, void, string>) {
	const workspace = await db.workspace.findUnique({
		where: { id: job.data.workspaceId },
		select: { id: true,  },
	});

	if (!workspace) throw new Error("Workspace not found");

	const update = await db.workspace.update({
		where: {
			id: workspace.id,
		},
		data: {
			billingPlan: job.data.plan,
		}
	})
}
