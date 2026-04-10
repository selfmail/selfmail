import { Polar } from "@polar-sh/sdk";
import { PolarSubscription } from "./subscription";

export class PaymentsProcessorPolar {
  polar: Polar;
  subscription: PolarSubscription;
  constructor(apiKey?: string, mode?: "production" | "sandbox") {
    this.polar = new Polar({
      accessToken: apiKey || process.env.POLAR_ACCESS_TOKEN,
      server:
        mode ||
        (process.env.POLAR_MODE as "production" | "sandbox") ||
        "sandbox",
    });

    this.subscription = new PolarSubscription(this.polar);
  }
}
