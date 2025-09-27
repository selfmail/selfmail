import type { Job } from "bullmq";
import { db } from "database";
import { Logs } from "services";
import { Transactional } from "services/transactional";
import { generateBillingUpgradeTemplate } from "transactional";

export interface UpgradeJobData {
	workspaceId: string;
	plan: "free" | "pro" | "premium";

	upgradeAt: Date;
}

export async function upgrade(job: Job<UpgradeJobData, void, string>) {
	const workspace = await db.workspace.findUnique({
		where: { id: job.data.workspaceId },
		select: {
			id: true,
			name: true,
			billingPlan: true,
			overlimit: true,
			overlimitAt: true,
			ownerId: true,
			owner: {
				select: {
					email: true,
					id: true,
					name: true,
				},
			},
		},
	});

	if (!workspace) {
		await Logs.error(
			`Workspace not found for upgrade job: ${job.data.workspaceId}`,
		);
		throw new Error("Workspace not found");
	}

	// check for used resources
	const workspaceUsedBytes = await db.email.aggregate({
		_sum: { sizeBytes: true },
		where: {
			address: {
				MemberAddress: {
					some: {
						member: {
							workspaceId: workspace.id,
						},
					},
				},
			},
		},
	});

	if (!workspaceUsedBytes?._sum) {
		Logs.error("Failed to get used storage for workspace");
	}

	const newPlan = await db.plan.findUnique({
		where: {
			name: job.data.plan,
		},
	});

	if (!newPlan) {
		await Logs.error(`Plan not found for upgrade job: ${job.data.plan}`);
		throw new Error("Plan not found");
	}

	await db.workspace.update({
		where: {
			id: workspace.id,
		},
		data: {
			billingPlan: job.data.plan,
		},
	});

	// notify the owner of the workspace that the upgrade was successful
	const { text, html } = await generateBillingUpgradeTemplate({
		oldPlan: workspace.billingPlan,
		newPlan: newPlan.name,
		workspaceName: workspace.name,
		name: workspace.owner.name || "there",
	});

	await Transactional.send({
		to: workspace.owner.email,
		from: "no-reply@transactional.selfmail.app",
		subject: `Billing upgrade for workspace ${workspace.name}`,
		text,
		html,
	}).catch(async (err) => {
		await Logs.error(
			`Failed to send upgrade email to workspace owner ${workspace.owner.id}: ${err.message}`,
		);
	});
}
