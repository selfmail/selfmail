import { Effect } from "effect";
import type Stripe from "stripe";

export const handlePaymentEvent = (event: Stripe.Event) =>
  Effect.gen(function* () {
    // TODO: Atomically deduplicate event.id with the database updates below.
    // TODO: Resolve the account from trusted Stripe customer/subscription mappings.
    // TODO: Reconcile out-of-order deliveries before updating billing state.
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        // TODO: Save customer/subscription mappings; fulfill only paid sessions.
        // Subscription access must follow invoice/subscription state, not checkout alone.
        break;
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        // TODO: Mark the checkout attempt failed or expired without granting access.
        break;
      case "payment_intent.succeeded":
        // TODO: Record the successful payment, amount, currency, and customer.
        break;
      case "payment_intent.payment_failed":
      case "payment_intent.canceled":
        // TODO: Record the failed/canceled payment and its failure details.
        break;
      case "invoice.paid":
        // TODO: Record the paid invoice and reconcile the subscription entitlement period.
        break;
      case "invoice.payment_failed":
      case "invoice.payment_action_required":
        // TODO: Record the invoice payment issue and update the account billing state.
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        // TODO: Synchronize subscription status, prices, periods, and cancellation.
        // TODO: Grant/revoke entitlements according to the subscription status.
        break;
      case "charge.refunded":
        // TODO: Record partial/full refunds and reconcile affected entitlements.
        break;
      default:
        yield* Effect.logInfo("Stripe event ignored", {
          eventId: event.id,
          eventType: event.type,
        });
        return { eventId: event.id, status: "ignored" as const };
    }

    yield* Effect.logInfo("Stripe event handled; persistence pending", {
      eventId: event.id,
      eventType: event.type,
      objectId: event.data.object.id,
    });
    return { eventId: event.id, status: "handled" as const };
  });
