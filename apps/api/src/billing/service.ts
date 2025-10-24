import Stripe from "stripe";
import { BillingModule } from "./module";
import { db } from "database";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

export abstract class BillingService {
	static async processWebhook(
		body: string,
		signature: string,
	): Promise<BillingModule.WebhookSuccessResponse | BillingModule.WebhookErrorResponse> {
		try {
			const event = await this.verifyWebhookSignature(body, signature);
			const processed = await this.handleWebhookEvent(event);
			
			return {
				success: true,
				message: `Successfully processed ${event.type}`,
				processed,
			};
		} catch (error) {
			console.error("Webhook processing error:", error);
			
			if (error instanceof Error) {
				return {
					success: false,
					error: error.message,
					code: this.getErrorCode(error),
				};
			}
			
			return {
				success: false,
				error: "Unknown error occurred",
				code: BillingModule.WebhookErrorCode.PROCESSING_ERROR,
			};
		}
	}

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
				throw new Error(`Webhook signature verification failed: ${error.message}`);
			}
			throw new Error("Webhook signature verification failed");
		}
	}

	private static async handleWebhookEvent(
		event: BillingModule.StripeWebhookEvent,
	): Promise<boolean> {
		console.log(`Processing webhook event: ${event.type}`);

		switch (event.type) {
			case "customer.subscription.created":
				return await this.handleSubscriptionCreated(event);
			case "customer.subscription.updated":
				return await this.handleSubscriptionUpdated(event);
			case "customer.subscription.deleted":
				return await this.handleSubscriptionDeleted(event);
			case "invoice.payment_succeeded":
				return await this.handlePaymentSucceeded(event);
			case "invoice.payment_failed":
				return await this.handlePaymentFailed(event);
			case "customer.created":
				return await this.handleCustomerCreated(event);
			case "customer.updated":
				return await this.handleCustomerUpdated(event);
			case "customer.deleted":
				return await this.handleCustomerDeleted(event);
			default:
				console.log(`Unhandled event type: ${event.type}`);
				return false;
		}
	}

    // SUBSCRIPTION EVENT HANDLERS

	private static async handleSubscriptionCreated(
		event: BillingModule.StripeWebhookEvent,
	): Promise<boolean> {
		const subscription = event.data.object as Stripe.Subscription;
		const plan = await db
        
		return true;
	}

	private static async handleSubscriptionUpdated(
		event: BillingModule.StripeWebhookEvent,
	): Promise<boolean> {
		const subscription = event.data.object as Stripe.Subscription;
		console.log(`Subscription updated: ${subscription.id}`);
		return true;
	}

	private static async handleSubscriptionDeleted(
		event: BillingModule.StripeWebhookEvent,
	): Promise<boolean> {
		const subscription = event.data.object as Stripe.Subscription;
		console.log(`Subscription deleted: ${subscription.id}`);
		return true;
	}

	private static async handlePaymentSucceeded(
		event: BillingModule.StripeWebhookEvent,
	): Promise<boolean> {
		const invoice = event.data.object as Stripe.Invoice;
		console.log(`Payment succeeded for invoice: ${invoice.id}`);
		return true;
	}

	private static async handlePaymentFailed(
		event: BillingModule.StripeWebhookEvent,
	): Promise<boolean> {
		const invoice = event.data.object as Stripe.Invoice;
		console.log(`Payment failed for invoice: ${invoice.id}`);
		return true;
	}

	private static async handleCustomerCreated(
		event: BillingModule.StripeWebhookEvent,
	): Promise<boolean> {
		const customer = event.data.object as Stripe.Customer;
		console.log(`Customer created: ${customer.id}`);
		return true;
	}

	private static async handleCustomerUpdated(
		event: BillingModule.StripeWebhookEvent,
	): Promise<boolean> {
		const customer = event.data.object as Stripe.Customer;
		console.log(`Customer updated: ${customer.id}`);
		return true;
	}

	private static async handleCustomerDeleted(
		event: BillingModule.StripeWebhookEvent,
	): Promise<boolean> {
		const customer = event.data.object as Stripe.Customer;
		console.log(`Customer deleted: ${customer.id}`);
		return true;
	}

	private static getErrorCode(error: Error): string {
		if (error.message.includes("signature")) {
			return BillingModule.WebhookErrorCode.INVALID_SIGNATURE;
		}
		if (error.message.includes("Webhook secret")) {
			return BillingModule.WebhookErrorCode.MISSING_WEBHOOK_SECRET;
		}
		if (error.message.includes("parse") || error.message.includes("validation")) {
			return BillingModule.WebhookErrorCode.PARSING_ERROR;
		}
		return BillingModule.WebhookErrorCode.PROCESSING_ERROR;
	}
}
