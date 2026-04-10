import { Polar } from "@polar-sh/sdk";
import { PolarSubscription } from "./subscription";

export class PaymentsProcessorPolar {
  polar: Polar;
  subscription: PolarSubscription;
  constructor() {
    this.polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: (process.env.POLAR_MODE as "production" | "sandbox") || "sandbox",
    });

    this.subscription = new PolarSubscription(this.polar);
  }
}
