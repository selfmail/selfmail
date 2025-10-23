import type { WebhookSubscriptionCreatedPayload } from "@polar-sh/sdk/src/models/components/webhooksubscriptioncreatedpayload";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY || "");

// Handling the webhook in the `index.ts` file for simplicity
export abstract class BillingService {
	static async handleSubscriptionCreated(
		payload: WebhookSubscriptionCreatedPayload,
	) {}
}
