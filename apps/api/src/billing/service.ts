import Stripe from "stripe";
import { BillingModule } from "./module";
import { CustomerService } from "./services/customer";
import { BillingLogger } from "./services/logger";
import { PaymentService } from "./services/payment";
import { SubscriptionService } from "./services/subscription";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

/**
 * Main billing service that handles webhook processing and delegates to specialized services
 */
export abstract class BillingService {
	/**
	 * Process incoming Stripe webhook events
	 */
	static async processWebhook(
		body: string,
		signature: string,
	): Promise<
		BillingModule.WebhookSuccessResponse | BillingModule.WebhookErrorResponse
	> {
		try {
			const event = await BillingService.verifyWebhookSignature(
				body,
				signature,
			);
			const processed = await BillingService.handleWebhookEvent(event);

			return {
				success: true,
				message: `Successfully processed ${event.type}`,
				processed,
			};
		} catch (error) {
			await BillingLogger.error("Webhook processing error", {
				error: error instanceof Error ? error.message : "Unknown error",
			});

			if (error instanceof Error) {
				return {
					success: false,
					error: error.message,
					code: BillingService.getErrorCode(error),
				};
			}

			return {
				success: false,
				error: "Unknown error occurred",
				code: BillingModule.WebhookErrorCode.PROCESSING_ERROR,
			};
		}
	}

	/**
	 * Verify webhook signature from Stripe
	 */
	private static async verifyWebhookSignature(
		body: string,
		signature: string,
	): Promise<BillingModule.StripeWebhookEvent> {
		if (!process.env.STRIPE_WEBHOOK_SECRET) {
			throw new Error("Webhook secret not configured");
		}

		try {
			const event = await stripe.webhooks.constructEventAsync(
				body,
				signature,
				process.env.STRIPE_WEBHOOK_SECRET,
			);

			return BillingModule.StripeWebhookSchema.parse(event);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(
					`Webhook signature verification failed: ${error.message}`,
				);
			}
			throw new Error("Webhook signature verification failed");
		}
	}

	/**
	 * Route webhook events to appropriate service handlers
	 */
	private static async handleWebhookEvent(
		event: BillingModule.StripeWebhookEvent,
	): Promise<boolean> {
		BillingLogger.info(`Processing webhook event: ${event.type}`, {
			eventId: event.id,
		});

		try {
			switch (event.type) {
				// Subscription events
				case "customer.subscription.created":
					return await SubscriptionService.handleCreated(
						event.data.object as Stripe.Subscription,
						{ id: event.id, type: event.type },
					);

				case "customer.subscription.updated":
					return await SubscriptionService.handleUpdated(
						event.data.object as Stripe.Subscription,
						(event.data.previous_attributes as Partial<Stripe.Subscription>) ||
							{},
						{ id: event.id, type: event.type },
					);

				case "customer.subscription.deleted":
					return await SubscriptionService.handleDeleted(
						event.data.object as Stripe.Subscription,
						{ id: event.id, type: event.type },
					);

				// Payment events
				case "invoice.payment_succeeded":
					return await PaymentService.handlePaymentSucceeded(
						event.data.object as Stripe.Invoice,
						{ id: event.id, type: event.type },
					);

				case "invoice.payment_failed":
					return await PaymentService.handlePaymentFailed(
						event.data.object as Stripe.Invoice,
						{ id: event.id, type: event.type },
					);

				// Customer events
				case "customer.created":
					return await CustomerService.handleCreated(
						event.data.object as Stripe.Customer,
					);

				case "customer.updated":
					return await CustomerService.handleUpdated(
						event.data.object as Stripe.Customer,
					);

				case "customer.deleted":
					return await CustomerService.handleDeleted(
						event.data.object as Stripe.Customer,
					);

				default:
					BillingLogger.warn(`Unhandled event type: ${event.type}`, {
						eventId: event.id,
					});
					return false;
			}
		} catch (error) {
			await BillingLogger.error(`Failed to handle event ${event.type}`, {
				eventId: event.id,
				error: error instanceof Error ? error.message : "Unknown error",
			});
			return false;
		}
	}

	/**
	 * Map error messages to error codes
	 */
	private static getErrorCode(error: Error): string {
		if (error.message.includes("signature")) {
			return BillingModule.WebhookErrorCode.INVALID_SIGNATURE;
		}
		if (error.message.includes("Webhook secret")) {
			return BillingModule.WebhookErrorCode.MISSING_WEBHOOK_SECRET;
		}
		if (
			error.message.includes("parse") ||
			error.message.includes("validation")
		) {
			return BillingModule.WebhookErrorCode.PARSING_ERROR;
		}
		return BillingModule.WebhookErrorCode.PROCESSING_ERROR;
	}
}
