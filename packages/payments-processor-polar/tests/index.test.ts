import { describe, expect, test } from "bun:test";
import { PaymentsProcessorPolar } from "../src";

describe("Payments Processor Polar", () => {
  const paymentProcessor = new PaymentsProcessorPolar(
    process.env.POLAR_ACCESS_TOKEN,
    "sandbox"
  );

  test("should initialize Polar client", () => {
    expect(paymentProcessor.polar).toBeDefined();
  });
});
