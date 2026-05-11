import { Polar } from "@polar-sh/sdk";
import { PolarCustomers } from "./customers";
import { PolarPortal } from "./portal";
import { PolarSeats } from "./seats";
import { PolarSubscription } from "./subscription";
import { PolarWebhooks } from "./webhooks";

export type PolarWebhookPayload = ReturnType<PolarWebhooks["validate"]>;

export class PaymentsProcessorPolar {
  polar: Polar;
  customers: PolarCustomers;
  subscription: PolarSubscription;
  seats: PolarSeats;
  portal: PolarPortal;
  webhooks: PolarWebhooks;

  constructor(
    apiKey?: string,
    mode?: "production" | "sandbox",
    webhookSecret?: string
  ) {
    this.polar = new Polar({
      accessToken: apiKey || process.env.POLAR_ACCESS_TOKEN,
      server:
        mode ||
        (process.env.POLAR_MODE as "production" | "sandbox") ||
        "sandbox",
    });

    this.customers = new PolarCustomers(this.polar);
    this.portal = new PolarPortal(this.polar);
    this.subscription = new PolarSubscription(this.polar);
    this.seats = new PolarSeats(this.polar);
    this.webhooks = new PolarWebhooks(webhookSecret);
  }
}
