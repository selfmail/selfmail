import { PaymentsProcessorPolar } from "@selfmail/payments-processor-polar";
import { Subscription } from "./subscription";

export class Payments {
  paymentProcessor: PaymentsProcessorPolar;
  subscription: Subscription;

  constructor() {
    this.paymentProcessor = new PaymentsProcessorPolar();
    this.subscription = new Subscription(this.paymentProcessor);
  }
}
