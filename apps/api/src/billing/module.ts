import { z } from "zod";

export namespace BillingModule {
	export const StripeWebhookSchema = z.object({
		id: z.string(),
		object: z.literal("event"),
		api_version: z.string().optional(),
		created: z.number(),
		data: z.object({
			object: z.record(z.string(), z.any()),
			previous_attributes: z.record(z.string(), z.any()).optional(),
		}),
		livemode: z.boolean(),
		pending_webhooks: z.number(),
		request: z
			.object({
				id: z.string().nullable(),
				idempotency_key: z.string().nullable(),
			})
			.nullable(),
		type: z.string(),
	});

	export const SubscriptionEventTypes = [
		"customer.subscription.created",
		"customer.subscription.updated",
		"customer.subscription.deleted",
		"invoice.payment_succeeded",
		"invoice.payment_failed",
		"customer.created",
		"customer.updated",
		"customer.deleted",
	] as const;

	export type SubscriptionEventType = (typeof SubscriptionEventTypes)[number];

	export const WebhookSuccessResponse = z.object({
		success: z.boolean(),
		message: z.string(),
		processed: z.boolean(),
	});

	export const WebhookErrorResponse = z.object({
		success: z.literal(false),
		error: z.string(),
		code: z.string().optional(),
	});

	export type StripeWebhookEvent = z.infer<typeof StripeWebhookSchema>;
	export type WebhookSuccessResponse = z.infer<typeof WebhookSuccessResponse>;
	export type WebhookErrorResponse = z.infer<typeof WebhookErrorResponse>;

	export enum WebhookErrorCode {
		INVALID_SIGNATURE = "INVALID_SIGNATURE",
		PARSING_ERROR = "PARSING_ERROR",
		PROCESSING_ERROR = "PROCESSING_ERROR",
		UNKNOWN_EVENT_TYPE = "UNKNOWN_EVENT_TYPE",
		MISSING_WEBHOOK_SECRET = "MISSING_WEBHOOK_SECRET",
	}
}
