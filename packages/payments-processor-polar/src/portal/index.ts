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

  async createCustomerPortalSession({
    externalCustomerId,
    returnUrl,
    externalMemberId,
  }: {
    externalCustomerId: string;
    returnUrl?: string;
    externalMemberId?: string;
  }) {
    const session = await this.polar.customerSessions.create({
      externalCustomerId,
      externalMemberId,
      returnUrl,
    });

    return {
      customerPortalUrl: session.customerPortalUrl,
      expiresAt: session.expiresAt,
      token: session.token,
    };
  }
}
