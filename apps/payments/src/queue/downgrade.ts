import type { Job } from "bullmq";
import { db } from "database";
import { Logs } from "services/logs";

export interface DowngradeJobData {
	workspaceId: string;
	plan: "free" | "pro" | "premium";

	reason?: string;
	note?: string;

	downgradeAt: Date;
}


// TODO: add logs to keep track of errors
export async function downgrade(job: Job<DowngradeJobData, void, string>) {
	const workspace = await db.workspace.findUnique({
		where: { id: job.data.workspaceId },
		select: { id: true, },
	});

	if (!workspace) throw new Error("Workspace not found");

	// check for used resources
	const workspaceUsedBytes = await db.email.aggregate({
		_sum: { sizeBytes: true },
		where: {
			address: {
				MemberAddress: {
					some: {
						member: {
							workspaceId: workspace.id
						}
					}
				}
			}
		}
	});

	if (!workspaceUsedBytes?._sum) {
		Logs.error("Failed to get used storage for workspace")
	}

	const newPlan = await db.plan.findUnique({
		where: {
			name: job.data.plan
		}
	})

	if (!newPlan) throw new Error("Plan not found")

	if (workspaceUsedBytes._sum.sizeBytes && workspaceUsedBytes._sum.sizeBytes > newPlan.storageBytes) {
		// TODO: keep track of too much storage usage attempts
		throw new Error("Cannot downgrade: used storage exceeds new plan's limit");
	}

	const update = await db.workspace.update({
		where: {
			id: workspace.id,
		},
		data: {
			billingPlan: job.data.plan,
		}
	})
}
