import { db, type Plan } from "database";
import type Stripe from "stripe";

/**
 * Helper service for common billing operations and data lookups
 */
export abstract class BillingHelpers {
	/**
	 * Find workspace by Stripe customer ID
	 */
	static async findWorkspaceByCustomerId(customerId: string) {
		return await db.workspace.findFirst({
			where: {
				Subscription: {
					some: {
						stripeCustomerId: customerId,
					},
				},
			},
			include: { plan: true },
		});
	}

	/**
	 * Get plan from Stripe product ID
	 */
	static async getPlanFromStripeProduct(productId: string) {
		return await db.plan.findUnique({
			where: { stripeProductId: productId },
		});
	}

	/**
	 * Map Stripe subscription status to internal enum
	 */
	static mapStripeStatusToInternal(
		stripeStatus: string,
	):
		| "ACTIVE"
		| "CANCELED"
		| "INCOMPLETE"
		| "INCOMPLETE_EXPIRED"
		| "PAST_DUE"
		| "TRIALING"
		| "UNPAID"
		| "PAUSED" {
		switch (stripeStatus) {
			case "active":
				return "ACTIVE";
			case "canceled":
				return "CANCELED";
			case "incomplete":
				return "INCOMPLETE";
			case "incomplete_expired":
				return "INCOMPLETE_EXPIRED";
			case "past_due":
				return "PAST_DUE";
			case "trialing":
				return "TRIALING";
			case "unpaid":
				return "UNPAID";
			case "paused":
				return "PAUSED";
			default:
				return "ACTIVE";
		}
	}

	/**
	 * Initialize seat tracking for a workspace
	 */
	static async initializeSeats(
		workspaceId: string,
		plan: Plan,
		subscription: Stripe.Subscription,
	) {
		const quantity = subscription.items.data[0]?.quantity || plan.baseSeats;

		await db.workspaceSeats.upsert({
			where: { workspaceId },
			create: {
				workspaceId,
				purchasedSeats: quantity,
				usedSeats: 1, // Owner takes 1 seat
			},
			update: {
				purchasedSeats: quantity,
			},
		});
	}

	/**
	 * Update seat allocations when plan changes
	 */
	static async updateSeatsForPlanChange(
		workspaceId: string,
		newPlan: Plan,
		subscription: Stripe.Subscription,
	) {
		const newQuantity =
			subscription.items.data[0]?.quantity || newPlan.baseSeats;

		await db.workspaceSeats.upsert({
			where: { workspaceId },
			create: {
				workspaceId,
				purchasedSeats: newQuantity,
				usedSeats: 1,
			},
			update: {
				purchasedSeats: newQuantity,
			},
		});
	}

	/**
	 * Get the free plan (fallback for canceled subscriptions)
	 */
	static async getFreePlan() {
		return await db.plan.findFirst({
			where: { name: "Free" },
		});
	}

	/**
	 * Count failed payments for a subscription in the last 30 days
	 */
	static async countRecentFailedPayments(subscriptionId: string) {
		return await db.paymentRecord.count({
			where: {
				subscriptionId,
				status: "FAILED",
				createdAt: {
					gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
				},
			},
		});
	}
}
