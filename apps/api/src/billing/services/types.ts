import type Stripe from "stripe";

/**
 * Helper functions to safely access Stripe object properties
 * Uses type assertions to handle properties that might not be in the type definitions
 */
export class StripeHelpers {
	/**
	 * Safely get subscription period dates
	 */
	static getSubscriptionPeriod(subscription: Stripe.Subscription) {
		const sub = subscription as Stripe.Subscription & {
			current_period_start: number;
			current_period_end: number;
		};
		return {
			start: new Date((sub.current_period_start || 0) * 1000),
			end: new Date((sub.current_period_end || 0) * 1000),
		};
	}

	/**
	 * Safely get subscription trial dates
	 */
	static getSubscriptionTrial(subscription: Stripe.Subscription) {
		const sub = subscription as Stripe.Subscription & {
			trial_start?: number;
			trial_end?: number;
		};
		return {
			start: sub.trial_start ? new Date(sub.trial_start * 1000) : null,
			end: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
		};
	}

	/**
	 * Safely get subscription cancellation dates
	 */
	static getSubscriptionCancellation(subscription: Stripe.Subscription) {
		const sub = subscription as Stripe.Subscription & {
			cancel_at?: number;
			canceled_at?: number;
			cancel_at_period_end?: boolean;
		};
		return {
			cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
			canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
			cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
		};
	}

	/**
	 * Safely get invoice subscription ID
	 */
	static getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
		const inv = invoice as Stripe.Invoice & { subscription?: string };
		return inv.subscription || null;
	}

	/**
	 * Safely get invoice payment intent ID
	 */
	static getInvoicePaymentIntentId(invoice: Stripe.Invoice): string | null {
		const inv = invoice as Stripe.Invoice & { payment_intent?: string };
		return inv.payment_intent || null;
	}

	/**
	 * Safely get invoice period dates
	 */
	static getInvoicePeriod(invoice: Stripe.Invoice) {
		const inv = invoice as Stripe.Invoice & {
			period_start?: number;
			period_end?: number;
		};
		return {
			start: inv.period_start ? new Date(inv.period_start * 1000) : null,
			end: inv.period_end ? new Date(inv.period_end * 1000) : null,
		};
	}
}
