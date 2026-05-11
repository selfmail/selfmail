import type { Polar } from "@polar-sh/sdk";

export class PolarSubscription {
  polar: Polar;
  constructor(polarClient: Polar) {
    this.polar = polarClient;
  }

  async createFreePlanSubscription({
    customerId,
    externalCustomerId,
    productId,
  }: {
    customerId: string;
    externalCustomerId: string;
    productId: string;
  }) {
    const subscription = await this.polar.subscriptions.create({
      productId,
      customerId,
      externalCustomerId,
      metadata: {
        workspaceId: externalCustomerId,
      },
    });

    return {
      polarCustomerId: customerId,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      productId: subscription.productId,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
    };
  }

  async upgradeToPaidSubscription({
    seats,
    includeTrial = true,
    customerEmail,
    externalCustomerId,
    metadata,
    subscriptionId,
    productId,
    successUrl,
    returnBackUrl,
  }: {
    seats: number;
    productId: string;
    subscriptionId: string;
    successUrl: string;
    customerEmail: string;
    externalCustomerId: string;
    returnBackUrl: string;
    includeTrial: boolean;
    metadata?: Record<string, string | number | boolean>;
  }) {
    const checkout = await this.polar.checkouts.create({
      products: [productId],
      seats,
      allowTrial: includeTrial,
      customerEmail,
      externalCustomerId,
      subscriptionId,
      successUrl,
      returnUrl: returnBackUrl,
      metadata: {
        ...metadata,
        plan: "BASIC",
      },
    });

    return {
      url: checkout.url,
      checkoutId: checkout.id,
      status: checkout.status,
    };
  }

  // TODO: manage workflows (e.g. reminders, data deletions, etc.) after subscription cancellation
  async cancelSubscription(subscriptionId: string) {
    await this.polar.subscriptions.revoke({
      id: subscriptionId,
    });
  }
}
