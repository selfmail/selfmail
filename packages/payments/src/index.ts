import { PaymentsProcessorPolar } from "@selfmail/payments-processor-polar";
import { Subscription } from "./subscription";

export class Payments {
  private readonly paymentProcessor: PaymentsProcessorPolar;

  constructor() {
    this.paymentProcessor = new PaymentsProcessorPolar({
      apiKey: process.env.POLAR_KEY,
    });
  }

  // use: new Payments().workspace(workspaceId).subscription.createCheckout(...)
  workspace(workspaceId: string) {
    return {
      subscription: new Subscription({
        workspaceId,
        paymentProcessor: this.paymentProcessor,
      }),
    };
  }
}
