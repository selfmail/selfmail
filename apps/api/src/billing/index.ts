import Elysia from "elysia";
import { BillingService } from "./service";
import { BillingModule } from "./module";

export const billing = new Elysia({
	prefix: "/billing",
	detail: {
		description: "Internal billing related endpoints, not for the public.",
	},
}).post("/webhooks", async ({ body, headers, set, request }) => {
	try {
		const rawBody = await request.text();
		const signature = headers["stripe-signature"];
		
		if (!signature) {
			set.status = 400;
			return {
				success: false,
				error: "Missing Stripe signature",
				code: BillingModule.WebhookErrorCode.INVALID_SIGNATURE,
			} satisfies BillingModule.WebhookErrorResponse;
		}

		const result = await BillingService.processWebhook(rawBody, signature);
		
		if (!result.success) {
			set.status = 400;
		}
		
		return result;
	} catch (error) {
		console.error("Webhook endpoint error:", error);
		
		set.status = 500;
		return {
			success: false,
			error: "Internal server error",
			code: BillingModule.WebhookErrorCode.PROCESSING_ERROR,
		} satisfies BillingModule.WebhookErrorResponse;
	}
});
