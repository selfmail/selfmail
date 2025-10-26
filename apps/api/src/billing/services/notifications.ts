import { db } from "database";
import { Transactional } from "services/transactional";
import { generateBillingUpgradeTemplate } from "transactional";
import { BillingLogger } from "./logger";

/**
 * Service to handle billing notifications and alerts
 * TODO: Integrate with your existing notification system when available
 */
export abstract class NotificationService {
	static async sendSubscriptionCreated(workspaceId: string, planName: string) {
		try {
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

			// filter for unqiue emails and may remove owner duplicate
			const uniqueEmails = new Set<{
				email: string;
				name: string;
			}>();
			const filteredAdmins = users.filter((admin) => {
				if (
					uniqueEmails.has({
						email: admin.email,
						name: admin.name,
					})
				) {
					return false;
				}
				uniqueEmails.add({
					email: admin.email,
					name: admin.name,
				});
				return true;
			});

			// Send notification email to all users with billing permissions (payments:update)
			for await (const admin of filteredAdmins) {
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
	) {
		try {
			let message = `Your subscription status changed from ${oldStatus} to ${newStatus}.`;

			if (planChanged && newPlanName) {
				message = `Your subscription plan has been changed to ${newPlanName}.`;
			}

			// TODO: Replace with actual notification system integration
			await db.notification.create({
				data: {
					memberId: await NotificationService.getWorkspaceOwnerId(workspaceId),
					type: "info",
					title: "Subscription Updated",
					message,
				},
			});

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
	static async sendSubscriptionCanceled(workspaceId: string) {
		try {
			// TODO: Replace with actual notification system integration
			await db.notification.create({
				data: {
					memberId: await NotificationService.getWorkspaceOwnerId(workspaceId),
					type: "warning",
					title: "Subscription Canceled",
					message:
						"Your subscription has been canceled. You'll have limited access to premium features.",
				},
			});

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
	 * Send notification when payment succeeds
	 */
	static async sendPaymentSucceeded(
		workspaceId: string,
		amount: number,
		currency: string,
	) {
		try {
			const formattedAmount = (amount / 100).toFixed(2); // Convert from cents

			// TODO: Replace with actual notification system integration
			await db.notification.create({
				data: {
					memberId: await NotificationService.getWorkspaceOwnerId(workspaceId),
					type: "info",
					title: "Payment Successful",
					message: `Your payment of ${formattedAmount} ${currency.toUpperCase()} has been processed successfully.`,
				},
			});

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
	}

	/**
	 * Send notification when payment fails
	 */
	static async sendPaymentFailed(
		workspaceId: string,
		amount: number,
		currency: string,
		failureReason?: string,
	) {
		try {
			const formattedAmount = (amount / 100).toFixed(2); // Convert from cents
			let message = `Your payment of ${formattedAmount} ${currency.toUpperCase()} failed. Please update your payment method.`;

			if (failureReason) {
				message += ` Reason: ${failureReason}`;
			}

			// TODO: Replace with actual notification system integration
			await db.notification.create({
				data: {
					memberId: await NotificationService.getWorkspaceOwnerId(workspaceId),
					type: "error",
					title: "Payment Failed",
					message,
				},
			});

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

	/**
	 * Helper to get workspace owner ID for notifications
	 */
	private static async getWorkspaceOwnerId(
		workspaceId: string,
	): Promise<string> {
		const workspace = await db.workspace.findUnique({
			where: { id: workspaceId },
			include: {
				Member: {
					where: {
						// Assuming workspace owner is the first member or has a special role
						// Adjust this query based on your actual role/permission system
					},
					take: 1,
				},
			},
		});

		// Fallback to first member if no specific owner logic
		return workspace?.Member[0]?.id || workspaceId;
	}
}
