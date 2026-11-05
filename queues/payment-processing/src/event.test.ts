import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import Stripe from "stripe";
import { parsePaymentEvent } from "./event";
import { handlePaymentEvent } from "./handle-event";

const secret = "whsec_test";
const receivedAt = Date.now();
const timestamp = Math.floor(receivedAt / 1000);

const signedJob = async (type = "payment_intent.succeeded") => {
  const payload = JSON.stringify({
    id: "evt_test",
    object: "event",
    type,
    data: { object: { id: "pi_test", object: "payment_intent" } },
  });
  return {
    payload,
    signature: await Stripe.webhooks.generateTestHeaderStringAsync({
      payload,
      secret,
      timestamp,
    }),
    receivedAt,
  };
};

describe("payment events", () => {
  test("verifies, parses, and dispatches a signed payment event", async () => {
    const event = await Effect.runPromise(
      parsePaymentEvent(await signedJob(), secret)
    );
    expect(await Effect.runPromise(handlePaymentEvent(event))).toEqual({
      eventId: "evt_test",
      status: "handled",
    });
  });

  test("ignores unsupported events", async () => {
    const event = await Effect.runPromise(
      parsePaymentEvent(await signedJob("customer.created"), secret)
    );
    expect(await Effect.runPromise(handlePaymentEvent(event))).toEqual({
      eventId: "evt_test",
      status: "ignored",
    });
  });

  test("rejects tampered payloads and wrong secrets", async () => {
    const job = await signedJob();
    expect(
      await Effect.runPromise(
        Effect.isFailure(
          parsePaymentEvent({ ...job, payload: `${job.payload} ` }, secret)
        )
      )
    ).toBe(true);
    expect(
      await Effect.runPromise(Effect.isFailure(parsePaymentEvent(job, "wrong")))
    ).toBe(true);
  });

  test("rejects signatures already stale at receipt", async () => {
    expect(
      await Effect.runPromise(
        Effect.isFailure(
          parsePaymentEvent(
            { ...(await signedJob()), receivedAt: receivedAt + 301_000 },
            secret
          )
        )
      )
    ).toBe(true);
  });

  test("accepts a delayed job using its original receipt time", async () => {
    const job = await signedJob();
    const oldReceipt = receivedAt - 600_000;
    job.receivedAt = oldReceipt;
    job.signature = await Stripe.webhooks.generateTestHeaderStringAsync({
      payload: job.payload,
      secret,
      timestamp: Math.floor(oldReceipt / 1000),
    });
    expect((await Effect.runPromise(parsePaymentEvent(job, secret))).id).toBe(
      "evt_test"
    );
  });

  test("rejects malformed job data", async () => {
    for (const data of [
      null,
      { paymentId: "pi_test" },
      { ...(await signedJob()), receivedAt: -1 },
    ]) {
      expect(
        await Effect.runPromise(
          Effect.isFailure(parsePaymentEvent(data, secret))
        )
      ).toBe(true);
    }
  });
});
