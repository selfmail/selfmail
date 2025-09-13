import type { Job } from "bullmq";
import { db } from "database";
import { Logs } from "services/logs";
import { Notify } from "services/notify";
import { Transactional } from "services/transactional";
import { generateBillingDowngradeTemplate, generateOverlimitTemplate } from "transactional"

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
					name: true
				}
			}
		}
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
		await db.workspace.update({
			where: {
				id: workspace.id
			},
			data: {
				overlimit: true,
				overlimitAt: new Date()
			},
			select: {}
		})

		await Notify.notifyUser({
			memberId: workspace.owner.id,
			title: "Workspace overlimit",
			message: `Your workspace is over the storage limit for the ${newPlan.name} plan. Please upgrade your plan or delete some data. Your workspace can't accept new data in 7 days from today. You need to loose ${(Number(workspaceUsedBytes._sum.sizeBytes) - Number(newPlan.storageBytes)) / (1024 * 1024)} MB to fit the new plan.`,
			type: "warning"
		})

		// send transactional email to the owner of the workspace

		const { text, html } = await generateOverlimitTemplate({
			oldPlan: workspace.billingPlan,
			newPlan: newPlan.name,
			workspaceName: workspace.name,
			name: workspace.owner.name || "there",
		})

		await Transactional.send({
			to: workspace.owner.email,
			from: "no-reply@transactional.selfmail.app",
			subject: `Overlimit for workspace ${workspace.name}`,
			text,
			html
		}).catch(async (err) => {
			await Logs.error(`Failed to send overlimit email to workspace owner ${workspace.owner.id}: ${err.message}`);
		})
	}

	await db.workspace.update({
		where: {
			id: workspace.id,
		},
		data: {
			billingPlan: job.data.plan,
		}
	})

	// notify the owner of the workspace that the downgrade was successful
	const { text, html } = await generateBillingDowngradeTemplate({
		oldPlan: workspace.billingPlan,
		newPlan: newPlan.name,
		workspaceName: workspace.name,
		name: workspace.owner.name || "there",
	})

	await Transactional.send({
		to: workspace.owner.email,
		from: "no-reply@transactional.selfmail.app",
		subject: `Billing downgrade for workspace ${workspace.name}`,
		text,
		html
	}).catch(async (err) => {
		await Logs.error(`Failed to send downgrade email to workspace owner ${workspace.owner.id}: ${err.message}`);
	})
}
