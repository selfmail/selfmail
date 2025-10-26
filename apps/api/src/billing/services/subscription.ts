import { db, type Plan } from "database";
import type Stripe from "stripe";
import { BillingHelpers } from "./helpers";
import { BillingLogger } from "./logger";
import { NotificationService } from "./notifications";
import { StripeHelpers } from "./types";

/**
 * Service to handle subscription-related webhook events
 */
export abstract class SubscriptionService {
	/**
	 * Handle subscription created event
	 */
	static async handleCreated(
		subscription: Stripe.Subscription,
		event: { id: string; type: string },
	): Promise<boolean> {
		try {
			// Find workspace by customer ID
			const workspace = await BillingHelpers.findWorkspaceByCustomerId(
				subscription.customer as string,
			);

			if (!workspace) {
				await BillingLogger.error(
					`Workspace not found for customer: ${subscription.customer}`,
					{
						stripeSubscriptionId: subscription.id,
						stripeEventId: event.id,
					},
				);
				return false;
			}

			// Get plan information from Stripe product
			const plan = await BillingHelpers.getPlanFromStripeProduct(
				subscription.items.data[0]?.price.product as string,
			);

			if (!plan) {
				await BillingLogger.error(
					`Plan not found for product: ${subscription.items.data[0]?.price.product}`,
					{
						stripeSubscriptionId: subscription.id,
						workspaceId: workspace.id,
					},
				);
				return false;
			}

			// Create subscription record
			const period = StripeHelpers.getSubscriptionPeriod(subscription);
			const trial = StripeHelpers.getSubscriptionTrial(subscription);

			const newSubscription = await db.subscription.create({
				data: {
					workspaceId: workspace.id,
					stripeSubscriptionId: subscription.id,
					stripeCustomerId: subscription.customer as string,
					currentPeriodStart: period.start,
					currentPeriodEnd: period.end,
					status: BillingHelpers.mapStripeStatusToInternal(subscription.status),
					amount: subscription.items.data[0]?.price.unit_amount || 0,
					currency: subscription.items.data[0]?.price.currency || "usd",
					interval:
						subscription.items.data[0]?.price.recurring?.interval || "month",
					trialStart: trial.start,
					trialEnd: trial.end,
				},
			});

			// Update workspace plan
			await db.workspace.update({
				where: { id: workspace.id },
				data: {
					planId: plan.id,
					planChangedAt: new Date(),
				},
			});

			// Create subscription history record
			await db.subscriptionHistory.create({
				data: {
					subscriptionId: newSubscription.id,
					eventType: "CREATED",
					newStatus: BillingHelpers.mapStripeStatusToInternal(
						subscription.status,
					),
					description: `Subscription created for plan: ${plan.name}`,
					stripeEventId: event.id,
					stripeEventType: event.type,
				},
			});

			// Initialize seat tracking
			await BillingHelpers.initializeSeats(workspace.id, plan, subscription);

			await NotificationService.sendSubscriptionCreated(
				workspace.id,
				plan.name,
			);

			// TODO: Log subscription creation activity in workspace activity feed

			BillingLogger.log(
				`Subscription created: ${subscription.id} for workspace: ${workspace.id}`,
			);

			return true;
		} catch (error) {
			await BillingLogger.error("Failed to handle subscription created", {
				stripeSubscriptionId: subscription.id,
				error: error instanceof Error ? error.message : "Unknown error",
			});
			return false;
		}
	}

	/**
	 * Handle subscription updated event
	 */
	static async handleUpdated(
		subscription: Stripe.Subscription,
		previousAttributes: Partial<Stripe.Subscription>,
		event: { id: string; type: string },
	): Promise<boolean> {
		try {
			const existingSubscription = await db.subscription.findUnique({
				where: { stripeSubscriptionId: subscription.id },
				include: { workspace: { include: { plan: true } } },
			});

			if (!existingSubscription) {
				await BillingLogger.error(`Subscription not found: ${subscription.id}`);
				return false;
			}

			const oldStatus = existingSubscription.status;
			const newStatus = BillingHelpers.mapStripeStatusToInternal(
				subscription.status,
			);

			// Get subscription period and cancellation details
			const period = StripeHelpers.getSubscriptionPeriod(subscription);
			const trial = StripeHelpers.getSubscriptionTrial(subscription);
			const cancellation =
				StripeHelpers.getSubscriptionCancellation(subscription);

			// Update subscription
			await db.subscription.update({
				where: { stripeSubscriptionId: subscription.id },
				data: {
					currentPeriodStart: period.start,
					currentPeriodEnd: period.end,
					status: newStatus,
					amount:
						subscription.items.data[0]?.price.unit_amount ||
						existingSubscription.amount,
					currency:
						subscription.items.data[0]?.price.currency ||
						existingSubscription.currency,
					interval:
						subscription.items.data[0]?.price.recurring?.interval ||
						existingSubscription.interval,
					cancelAtPeriodEnd: cancellation.cancelAtPeriodEnd,
					cancelAt: cancellation.cancelAt,
					canceledAt: cancellation.canceledAt,
					trialStart: trial.start,
					trialEnd: trial.end,
				},
			});

			// Check if plan changed
			let planChanged = false;
			let newPlan = null;

			if (previousAttributes.items) {
				const newProductId = subscription.items.data[0]?.price
					.product as string;
				newPlan = await BillingHelpers.getPlanFromStripeProduct(newProductId);

				if (newPlan && newPlan.id !== existingSubscription.workspace.planId) {
					planChanged = true;

					await db.workspace.update({
						where: { id: existingSubscription.workspaceId },
						data: {
							planId: newPlan.id,
							planChangedAt: new Date(),
						},
					});
				}
			}

			// Create history record
			const { eventType, description } = SubscriptionService.determineEventType(
				oldStatus,
				newStatus,
				planChanged,
				newPlan,
			);

			await db.subscriptionHistory.create({
				data: {
					subscriptionId: existingSubscription.id,
					eventType,
					oldStatus,
					newStatus,
					oldPlanId: planChanged ? existingSubscription.workspace.planId : null,
					newPlanId: planChanged && newPlan ? newPlan.id : null,
					description,
					stripeEventId: event.id,
					stripeEventType: event.type,
				},
			});

			// Handle status-specific logic
			await SubscriptionService.handleStatusChange(
				existingSubscription,
				oldStatus,
				newStatus,
			);

			// Update seat allocations if plan changed
			if (planChanged && newPlan) {
				await BillingHelpers.updateSeatsForPlanChange(
					existingSubscription.workspaceId,
					newPlan,
					subscription,
				);
			}

			// TODO: Send notification to workspace owner about subscription changes
			await NotificationService.sendSubscriptionUpdated(
				existingSubscription.workspaceId,
				oldStatus,
				newStatus,
				planChanged,
				newPlan?.name,
			);

			// TODO: Log subscription update activity in workspace activity feed

			BillingLogger.log(
				`Subscription updated: ${subscription.id}, Status: ${oldStatus} -> ${newStatus}`,
			);

			return true;
		} catch (error) {
			await BillingLogger.error("Failed to handle subscription updated", {
				stripeSubscriptionId: subscription.id,
				error: error instanceof Error ? error.message : "Unknown error",
			});
			return false;
		}
	}

	/**
	 * Handle subscription deleted event
	 */
	static async handleDeleted(
		subscription: Stripe.Subscription,
		event: { id: string; type: string },
	): Promise<boolean> {
		try {
			const existingSubscription = await db.subscription.findUnique({
				where: { stripeSubscriptionId: subscription.id },
				include: { workspace: true },
			});

			if (!existingSubscription) {
				await BillingLogger.error(`Subscription not found: ${subscription.id}`);
				return false;
			}

			// Update subscription status
			await db.subscription.update({
				where: { stripeSubscriptionId: subscription.id },
				data: {
					status: "CANCELED",
					canceledAt: new Date(),
				},
			});

			// Find and assign free plan
			const freePlan = await BillingHelpers.getFreePlan();

			if (freePlan) {
				await db.workspace.update({
					where: { id: existingSubscription.workspaceId },
					data: {
						planId: freePlan.id,
						planChangedAt: new Date(),
					},
				});
			}

			// Create history record
			await db.subscriptionHistory.create({
				data: {
					subscriptionId: existingSubscription.id,
					eventType: "CANCELED",
					oldStatus: existingSubscription.status,
					newStatus: "CANCELED",
					description: "Subscription deleted/canceled",
					stripeEventId: event.id,
					stripeEventType: event.type,
				},
			});

			// Create billing alert
			await db.billingAlert.create({
				data: {
					workspaceId: existingSubscription.workspaceId,
					type: "SUBSCRIPTION_CANCELED",
					message:
						"Your subscription has been canceled. Access to premium features will be limited.",
					severity: "WARNING",
				},
			});

			// Reset seat allocations
			await db.workspaceSeats.updateMany({
				where: { workspaceId: existingSubscription.workspaceId },
				data: { purchasedSeats: 1 }, // Reset to free plan default
			});

			// TODO: Send cancellation notification to workspace owner
			await NotificationService.sendSubscriptionCanceled(
				existingSubscription.workspaceId,
			);

			// TODO: Schedule data retention policy enforcement
			// TODO: Log subscription cancellation activity in workspace activity feed

			BillingLogger.log(
				`Subscription deleted: ${subscription.id} for workspace: ${existingSubscription.workspaceId}`,
			);

			return true;
		} catch (error) {
			await BillingLogger.error("Failed to handle subscription deleted", {
				stripeSubscriptionId: subscription.id,
				error: error instanceof Error ? error.message : "Unknown error",
			});
			return false;
		}
	}

	/**
	 * Determine the event type and description based on status changes
	 */
	private static determineEventType(
		oldStatus: string,
		newStatus: string,
		planChanged: boolean,
		newPlan: Plan | null,
	): {
		eventType:
			| "UPDATED"
			| "CANCELED"
			| "PLAN_CHANGED"
			| "TRIAL_STARTED"
			| "TRIAL_ENDED"
			| "REACTIVATED";
		description: string;
	} {
		if (planChanged && newPlan) {
			return {
				eventType: "PLAN_CHANGED",
				description: `Plan changed to: ${newPlan.name}`,
			};
		}

		if (oldStatus !== newStatus) {
			if (newStatus === "CANCELED") {
				return {
					eventType: "CANCELED",
					description: "Subscription canceled",
				};
			}
			if (oldStatus === "CANCELED" && newStatus === "ACTIVE") {
				return {
					eventType: "REACTIVATED",
					description: "Subscription reactivated",
				};
			}
			if (newStatus === "TRIALING") {
				return {
					eventType: "TRIAL_STARTED",
					description: "Trial period started",
				};
			}
		}

		return {
			eventType: "UPDATED",
			description: "Subscription updated",
		};
	}

	/**
	 * Handle status-specific logic and alerts
	 */
	private static async handleStatusChange(
		subscription: { workspaceId: string },
		_oldStatus: string,
		newStatus: string,
	) {
		switch (newStatus) {
			case "PAST_DUE":
				await db.billingAlert.create({
					data: {
						workspaceId: subscription.workspaceId,
						type: "PAYMENT_FAILED",
						message:
							"Your subscription payment is past due. Please update your payment method.",
						severity: "WARNING",
					},
				});
				break;

			case "CANCELED":
				await db.billingAlert.create({
					data: {
						workspaceId: subscription.workspaceId,
						type: "SUBSCRIPTION_CANCELED",
						message:
							"Your subscription has been canceled. Access to premium features is limited.",
						severity: "ERROR",
					},
				});
				break;
		}
	}
}
