import type { Polar } from "@polar-sh/sdk";

export class PolarPortal {
  polar: Polar;

  constructor(polar: Polar) {
    this.polar = polar;
  }

  async getSubscriptionDetails({ subscriptionId }: { subscriptionId: string }) {
    const subscription = await this.polar.subscriptions.get({
      id: subscriptionId,
    });
    return subscription;
  }

  // TODO: check whether Polar allows changing the subscription payment method via api, if not, implement polar
  // authorization system, so that users can change the payment method on the Polar-hosted portal
}
