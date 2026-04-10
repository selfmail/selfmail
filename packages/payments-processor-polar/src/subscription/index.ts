import type { Polar } from "@polar-sh/sdk";

export class PolarSubscription {
  polar: Polar;
  constructor(polarClient: Polar) {
    this.polar = polarClient;
  }

  async createFreePlanSubscription({
    productId,
    userId,
    email,
    locale,
  }: {
    productId: string;
    userId: string;
    locale: string | undefined;
    email: string;
  }) {
    // Create the customer
    const customer = await this.polar.customers.create({
      type: "individual",
      email,
      locale,
      externalId: userId,
    });

    // Create free subscription
    const subscription = await this.polar.subscriptions.create({
      productId,
      customerId: customer.id,
      externalCustomerId: userId,
    });

    return {
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
    };
  }

  async createSeatBasedSubscription({
    seats,
    includeTrial = true,
    customerEmail,
    productId,
    successUrl,
    returnBackUrl,
  }: {
    seats: number;
    productId: string;
    successUrl: string;
    customerEmail: string;
    returnBackUrl: string;
    includeTrial: boolean;
  }) {
    const checkout = await this.polar.checkouts.create({
      products: [productId],
      seats,
      allowTrial: includeTrial,
      customerEmail,
      successUrl,
      returnUrl: returnBackUrl,
    });

    return {
      url: checkout.url,
      checkoutId: checkout.id,
    };
  }

  // TODO: manage workflows (e.g. reminders, data deletions, etc.) after subscription cancellation
  async cancelSubscription(subscriptionId: string) {
    await this.polar.subscriptions.revoke({
      id: subscriptionId,
    });
  }
}
