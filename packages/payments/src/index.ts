import { PaymentsProcessorPolar } from "@selfmail/payments-processor-polar";
import { Billing } from "./billing";
import type { Subscription } from "./subscription";

export class Payments {
  paymentProcessor: PaymentsProcessorPolar;
  billing: Billing;
  subscription: Subscription;

  constructor() {
    this.paymentProcessor = new PaymentsProcessorPolar();
    this.billing = new Billing(this.paymentProcessor);
    this.subscription = this.billing;
  }
}
