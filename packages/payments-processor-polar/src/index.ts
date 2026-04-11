import { Polar } from "@polar-sh/sdk";
import { PolarPortal } from "./portal";
import { PolarSubscription } from "./subscription";

export class PaymentsProcessorPolar {
  polar: Polar;
  subscription: PolarSubscription;
  portal: PolarPortal;
  constructor(apiKey?: string, mode?: "production" | "sandbox") {
    this.polar = new Polar({
      accessToken: apiKey || process.env.POLAR_ACCESS_TOKEN,
      server:
        mode ||
        (process.env.POLAR_MODE as "production" | "sandbox") ||
        "sandbox",
    });

    this.portal = new PolarPortal(this.polar);
    this.subscription = new PolarSubscription(this.polar);
  }
}
