import { db } from "database";
import type Stripe from "stripe";
import { BillingHelpers } from "./helpers";
import { BillingLogger } from "./logger";
import { NotificationService } from "./notifications";
import { StripeHelpers } from "./types";

/**
 * Service to handle payment-related webhook events
 */
export abstract class PaymentService {
	/**
	 * Handle successful payment event
	 */
	static async handlePaymentSucceeded(
		invoice: Stripe.Invoice,
		_event: { id: string; type: string },
	): Promise<boolean> {
		try {
			const subscriptionId = StripeHelpers.getInvoiceSubscriptionId(invoice);

			if (!subscriptionId) {
				await BillingLogger.error(
					`No subscription found for invoice: ${invoice.id}`,
				);
				return false;
			}

			const subscription = await db.subscription.findUnique({
				where: { stripeSubscriptionId: subscriptionId },
				include: { workspace: true },
			});

			if (!subscription) {
				await BillingLogger.error(
					`Subscription not found for invoice: ${invoice.id}`,
				);
				return false;
			}

			// Get invoice period
			const period = StripeHelpers.getInvoicePeriod(invoice);
			const paymentIntentId = StripeHelpers.getInvoicePaymentIntentId(invoice);

			// Create payment record
			await db.paymentRecord.create({
				data: {
					subscriptionId: subscription.id,
					workspaceId: subscription.workspaceId,
					stripeInvoiceId: invoice.id,
					stripePaymentIntentId: paymentIntentId,
					amount: invoice.amount_paid,
					currency: invoice.currency,
					status: "SUCCEEDED",
					paymentMethod:
						invoice.payment_settings?.payment_method_types?.[0] || "unknown",
					periodStart: period.start,
					periodEnd: period.end,
					paidAt: new Date(),
				},
			});

			// Update workspace if it was overlimit
			if (subscription.workspace.overlimit) {
				await db.workspace.update({
					where: { id: subscription.workspaceId },
					data: {
						overlimit: false,
						overlimitAt: null,
					},
				});
			}

			// Resolve any payment-related alerts
			await db.billingAlert.updateMany({
				where: {
					workspaceId: subscription.workspaceId,
					type: "PAYMENT_FAILED",
					resolved: false,
				},
				data: {
					resolved: true,
					resolvedAt: new Date(),
				},
			});

			// TODO: Send payment confirmation notification to workspace owner
			await NotificationService.sendPaymentSucceeded(
				subscription.workspaceId,
				invoice.amount_paid,
				invoice.currency,
			);

			// TODO: Log successful payment activity in workspace activity feed

			BillingLogger.log(
				`Payment succeeded: ${invoice.id} for subscription: ${subscription.id}`,
			);

			return true;
		} catch (error) {
			await BillingLogger.error("Failed to handle payment succeeded", {
				stripeInvoiceId: invoice.id,
				error: error instanceof Error ? error.message : "Unknown error",
			});
			return false;
		}
	}

	/**
	 * Handle failed payment event
	 */
	static async handlePaymentFailed(
		invoice: Stripe.Invoice,
		_event: { id: string; type: string },
	): Promise<boolean> {
		try {
			const subscriptionId = StripeHelpers.getInvoiceSubscriptionId(invoice);

			if (!subscriptionId) {
				await BillingLogger.error(
					`No subscription found for invoice: ${invoice.id}`,
				);
				return false;
			}

			const subscription = await db.subscription.findUnique({
				where: { stripeSubscriptionId: subscriptionId },
				include: { workspace: true },
			});

			if (!subscription) {
				await BillingLogger.error(
					`Subscription not found for invoice: ${invoice.id}`,
				);
				return false;
			}

			// Get invoice period
			const period = StripeHelpers.getInvoicePeriod(invoice);

			// Create payment record
			await db.paymentRecord.create({
				data: {
					subscriptionId: subscription.id,
					workspaceId: subscription.workspaceId,
					stripeInvoiceId: invoice.id,
					amount: invoice.amount_due,
					currency: invoice.currency,
					status: "FAILED",
					failureCode: invoice.last_finalization_error?.code || "unknown",
					failureMessage:
						invoice.last_finalization_error?.message || "Payment failed",
					periodStart: period.start,
					periodEnd: period.end,
				},
			});

			// Create billing alert
			await db.billingAlert.create({
				data: {
					workspaceId: subscription.workspaceId,
					type: "PAYMENT_FAILED",
					message: `Payment failed for invoice ${invoice.number}. Please update your payment method.`,
					severity: "ERROR",
					metadata: {
						invoiceId: invoice.id,
						amount: invoice.amount_due,
						currency: invoice.currency,
						failureReason: invoice.last_finalization_error?.message,
					},
				},
			});

			// Mark workspace as overlimit after multiple failed attempts
			const failedPayments = await BillingHelpers.countRecentFailedPayments(
				subscription.id,
			);

			if (failedPayments >= 3) {
				await db.workspace.update({
					where: { id: subscription.workspaceId },
					data: {
						overlimit: true,
						overlimitAt: new Date(),
					},
				});

				BillingLogger.warn(
					`Workspace marked as overlimit due to ${failedPayments} failed payments`,
					{
						workspaceId: subscription.workspaceId,
						subscriptionId: subscription.id,
					},
				);
			}

			// TODO: Send payment failure notification to workspace owner
			await NotificationService.sendPaymentFailed(
				subscription.workspaceId,
				invoice.amount_due,
				invoice.currency,
				invoice.last_finalization_error?.message,
			);

			// TODO: Initiate dunning management process
			// TODO: Log payment failure activity in workspace activity feed

			BillingLogger.log(
				`Payment failed: ${invoice.id} for subscription: ${subscription.id}`,
			);

			return true;
		} catch (error) {
			await BillingLogger.error("Failed to handle payment failed", {
				stripeInvoiceId: invoice.id,
				error: error instanceof Error ? error.message : "Unknown error",
			});
			return false;
		}
	}
}
