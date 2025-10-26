import { db } from "database";
import { Transactional } from "services/transactional";
import {
	generateBillingDowngradeTemplate,
	generateBillingUpgradeTemplate,
	generateOverlimitTemplate,
	generateVerifyEmailTemplate,
} from "transactional";
import { BillingLogger } from "./logger";

/**
 * Service to handle billing notifications and alerts
 * TODO: Integrate with your existing notification system when available
 */
export abstract class NotificationService {
	/**
	 * Helper function to get workspace details and unique admin emails
	 */
	private static async getWorkspaceAndAdmins(workspaceId: string): Promise<{
		workspace: { name: string };
		admins: Array<{ email: string; name: string }>;
	}> {
		const workspace = await db.workspace.findUnique({
			where: { id: workspaceId },
			select: {
				name: true,
			},
		});
		if (!workspace) {
			throw new Error("Workspace not found");
		}

		// Fetch workspace admins' emails
		const adminEmails = await db.member.findMany({
			where: {
				workspaceId,
				MemberPermission: {
					every: {
						permissionName: "payments:update",
					},
				},
			},
			select: {
				user: {
					select: {
						email: true,
						name: true,
					},
				},
				workspace: {
					select: {
						owner: {
							select: {
								email: true,
								name: true,
							},
						},
					},
				},
			},
		});

		const users = [
			adminEmails.map((admin) => admin.user),
			adminEmails.map((admin) => admin.workspace.owner),
		].flat();

		// filter for unique emails and may remove owner duplicate
		const uniqueEmails = new Set<string>();
		const filteredAdmins = users.filter((admin) => {
			if (uniqueEmails.has(admin.email)) {
				return false;
			}
			uniqueEmails.add(admin.email);
			return true;
		});

		return {
			workspace,
			admins: filteredAdmins,
		};
	}
	static async sendSubscriptionCreated(workspaceId: string, planName: string) {
		try {
			const { workspace, admins } =
				await NotificationService.getWorkspaceAndAdmins(workspaceId);

			// Send notification email to all users with billing permissions (payments:update)
			for await (const admin of admins) {
				const { html, text } = await generateBillingUpgradeTemplate({
					name: admin.name,
					workspaceName: workspace.name,
				});
				await Transactional.send({
					to: admin.email,
					subject: "Subscription Created",
					text,
					html,
				});
			}

			BillingLogger.info(
				`Subscription creation notification sent for workspace: ${workspaceId}`,
			);
		} catch (error) {
			await BillingLogger.error(
				"Failed to send subscription created notification",
				{
					workspaceId,
					planName,
					error: error instanceof Error ? error.message : "Unknown error",
				},
			);
		}
	}

	/**
	 * Send notification when subscription is updated
	 */
	static async sendSubscriptionUpdated(
		workspaceId: string,
		oldStatus: string,
		newStatus: string,
		planChanged: boolean,
		newPlanName?: string,
		oldPlanName?: string,
	) {
		try {
			const { workspace, admins } =
				await NotificationService.getWorkspaceAndAdmins(workspaceId);

			// Send notification email to all users with billing permissions
			for await (const admin of admins) {
				let emailContent: { html: string; text: string };
				let subject: string;

				if (planChanged && newPlanName && oldPlanName) {
					// Determine if it's an upgrade or downgrade
					const planTiers = ["free", "starter", "pro", "enterprise"];
					const oldTier = planTiers.indexOf(oldPlanName.toLowerCase());
					const newTier = planTiers.indexOf(newPlanName.toLowerCase());

					if (newTier > oldTier) {
						// Upgrade
						emailContent = await generateBillingUpgradeTemplate({
							name: admin.name,
							workspaceName: workspace.name,
						});
						subject = "Subscription Upgraded";
					} else {
						// Downgrade
						emailContent = await generateBillingDowngradeTemplate({
							oldPlan: oldPlanName,
							newPlan: newPlanName,
							name: admin.name,
							workspaceName: workspace.name,
						});
						subject = "Subscription Downgraded";
					}
				} else {
					// Status change without plan change - use simple text
					const message = `Your subscription status changed from ${oldStatus} to ${newStatus}.`;
					emailContent = {
						html: `<p>${message}</p>`,
						text: message,
					};
					subject = "Subscription Updated";
				}

				await Transactional.send({
					to: admin.email,
					subject,
					text: emailContent.text,
					html: emailContent.html,
				});
			}

			BillingLogger.info(
				`Subscription update notification sent for workspace: ${workspaceId}`,
			);
		} catch (error) {
			await BillingLogger.error(
				"Failed to send subscription updated notification",
				{
					workspaceId,
					oldStatus,
					newStatus,
					error: error instanceof Error ? error.message : "Unknown error",
				},
			);
		}
	}

	/**
	 * Send notification when subscription is canceled
	 */
	static async sendSubscriptionCanceled(
		workspaceId: string,
		currentPlan?: string,
	) {
		try {
			const { workspace, admins } =
				await NotificationService.getWorkspaceAndAdmins(workspaceId);

			// Send notification email to all users with billing permissions
			for await (const admin of admins) {
				const emailContent = await generateBillingDowngradeTemplate({
					oldPlan: currentPlan || "Pro",
					newPlan: "Free",
					name: admin.name,
					workspaceName: workspace.name,
				});

				await Transactional.send({
					to: admin.email,
					subject: "Subscription Canceled",
					text: emailContent.text,
					html: emailContent.html,
				});
			}

			BillingLogger.info(
				`Subscription cancellation notification sent for workspace: ${workspaceId}`,
			);
		} catch (error) {
			await BillingLogger.error(
				"Failed to send subscription canceled notification",
				{
					workspaceId,
					error: error instanceof Error ? error.message : "Unknown error",
				},
			);
		}
	}

	/**
	 * Send notification when user exceeds plan limits
	 */
	static async sendOverlimitNotification(
		workspaceId: string,
		currentPlan: string,
		recommendedPlan: string,
	) {
		try {
			const { workspace, admins } =
				await NotificationService.getWorkspaceAndAdmins(workspaceId);

			// Send notification email to all users with billing permissions
			for await (const admin of admins) {
				const emailContent = await generateOverlimitTemplate({
					oldPlan: currentPlan,
					newPlan: recommendedPlan,
					name: admin.name,
					workspaceName: workspace.name,
				});

				await Transactional.send({
					to: admin.email,
					subject: "Plan Limit Exceeded - Upgrade Recommended",
					text: emailContent.text,
					html: emailContent.html,
				});
			}

			BillingLogger.info(
				`Overlimit notification sent for workspace: ${workspaceId}`,
			);
		} catch (error) {
			await BillingLogger.error("Failed to send overlimit notification", {
				workspaceId,
				currentPlan,
				recommendedPlan,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	/**
	 * Send email verification notification
	 */
	static async sendEmailVerification(
		email: string,
		name: string,
		token: number,
	) {
		try {
			const emailContent = await generateVerifyEmailTemplate({
				name,
				token,
			});

			await Transactional.send({
				to: email,
				subject: "Verify Your Email Address",
				text: emailContent.text,
				html: emailContent.html,
			});

			BillingLogger.info(`Email verification sent to: ${email}`);
		} catch (error) {
			await BillingLogger.error("Failed to send email verification", {
				email,
				name,
				token,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	/**
	 * Send notification when payment succeeds
	 */
	static async sendPaymentSucceeded(
		workspaceId: string,
		amount: number,
		currency: string,
	) {
		try {
			const { workspace, admins } =
				await NotificationService.getWorkspaceAndAdmins(workspaceId);
			const formattedAmount = (amount / 100).toFixed(2); // Convert from cents

			// Send notification email to all users with billing permissions
			for await (const admin of admins) {
				const message = `Your payment of ${formattedAmount} ${currency.toUpperCase()} has been processed successfully.`;

				await Transactional.send({
					to: admin.email,
					subject: "Payment Successful",
					text: message,
					html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
						<h2 style="color: #16a34a;">Payment Successful</h2>
						<p>Hi ${admin.name},</p>
						<p>${message}</p>
						<p>Thank you for your continued support!</p>
						<p>Best regards,<br>The ${workspace.name} Team</p>
					</div>`,
				});
			}

			BillingLogger.info(
				`Payment success notification sent for workspace: ${workspaceId}`,
			);
		} catch (error) {
			await BillingLogger.error("Failed to send payment success notification", {
				workspaceId,
				amount,
				currency,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	} /**
	 * Send notification when payment fails
	 */
	static async sendPaymentFailed(
		workspaceId: string,
		amount: number,
		currency: string,
		failureReason?: string,
	) {
		try {
			const { workspace, admins } =
				await NotificationService.getWorkspaceAndAdmins(workspaceId);
			const formattedAmount = (amount / 100).toFixed(2); // Convert from cents
			let message = `Your payment of ${formattedAmount} ${currency.toUpperCase()} failed. Please update your payment method.`;

			if (failureReason) {
				message += ` Reason: ${failureReason}`;
			}

			// Send notification email to all users with billing permissions
			for await (const admin of admins) {
				await Transactional.send({
					to: admin.email,
					subject: "Payment Failed - Action Required",
					text: message,
					html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
						<h2 style="color: #dc2626;">Payment Failed</h2>
						<p>Hi ${admin.name},</p>
						<p>${message}</p>
						<p>To avoid service interruption, please:</p>
						<ul>
							<li>Update your payment method in your billing settings</li>
							<li>Ensure your card has sufficient funds</li>
							<li>Check that your billing information is correct</li>
						</ul>
						<p>If you continue to experience issues, please contact our support team.</p>
						<p>Best regards,<br>The ${workspace.name} Team</p>
					</div>`,
				});
			}

			BillingLogger.info(
				`Payment failure notification sent for workspace: ${workspaceId}`,
			);
		} catch (error) {
			await BillingLogger.error("Failed to send payment failure notification", {
				workspaceId,
				amount,
				currency,
				failureReason,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}
}
