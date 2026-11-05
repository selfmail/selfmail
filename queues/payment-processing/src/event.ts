import { UnrecoverableError } from "bullmq";
import { Effect, Schema } from "effect";
import Stripe from "stripe";

export interface PaymentJobData {
  payload: string;
  signature: string;
  receivedAt: number;
}

const jobSchema = Schema.Struct({
  payload: Schema.String,
  signature: Schema.String,
  receivedAt: Schema.Number,
});

const eventSchema = Schema.Struct({
  id: Schema.String,
  object: Schema.Literal("event"),
  type: Schema.String,
  data: Schema.Struct({ object: Schema.Struct({ id: Schema.String }) }),
});

export const parsePaymentEvent = (data: unknown, webhookSecret: string) =>
  Effect.gen(function* () {
    const job = yield* Schema.decodeUnknownEffect(jobSchema)(data);

    const event = yield* Effect.tryPromise({
      try: async () => {
        if (!Number.isSafeInteger(job.receivedAt) || job.receivedAt <= 0) {
          throw new Error("Invalid webhook receipt time");
        }

        // Use the server's receipt time so queue delays do not expire valid signatures.
        return await Stripe.webhooks.constructEventAsync(
          job.payload,
          job.signature,
          webhookSecret,
          undefined,
          undefined,
          job.receivedAt
        );
      },
      catch: () => new UnrecoverableError("Invalid Stripe webhook event"),
    });

    yield* Schema.decodeUnknownEffect(eventSchema)(event);
    return event;
  });

export const getWebhookSecret = () => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is required");
  }
  return secret;
};
