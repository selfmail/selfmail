import { db } from "@selfmail/db";
import type { PaymentsProcessorPolar } from "@selfmail/payments-processor-polar";

export class Subscription {
  paymentProcessor: PaymentsProcessorPolar;

  constructor(paymentProcessor: PaymentsProcessorPolar) {
    this.paymentProcessor = paymentProcessor;
  }

  async createFreePlanSubscription({
    memberId,
    workspaceId,
  }: {
    memberId: string;
    workspaceId: string;
  }) {
    const user = await db.member.findUnique({
      where: {
        id: memberId,
        workspaceId,
      },
      select: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.user?.email) {
      throw new Error("User email is required to create a subscription");
    }

    // Create subscription in payment processor
    const subscription =
      await this.paymentProcessor.subscription.createFreePlanSubscription({
        productId: process.env.POLAR_PRODUCT_ID || "",
        userId: memberId,
        email: user.user.email,
      });

    if (!subscription) {
      throw new Error("Failed to create subscription");
    }

    return subscription;
  }

  async upgradeSubscriptionToBasicPaidPlan({
    returnBackUrl,
    subscriptionId,
    successUrl,
    memberId,
    workspaceId,
  }: {
    memberId: string;
    workspaceId: string;
    subscriptionId: string;
    successUrl: string;
    returnBackUrl: string;
  }) {
    const user = await db.member.findUnique({
      where: {
        id: memberId,
        workspaceId,
      },
      select: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.user?.email) {
      throw new Error("User email is required to upgrade subscription");
    }

    // Upgrade subscription in payment processor
    const checkoutUrl =
      await this.paymentProcessor.subscription.upgradeToPaidSubscription({
        productId: process.env.POLAR_PRODUCT_ID || "",
        subscriptionId,
        customerEmail: user.user.email,
        seats: 1,
        successUrl,
        returnBackUrl,
        includeTrial: false,
      });

    if (!checkoutUrl) {
      throw new Error("Failed to create checkout for subscription upgrade");
    }

    return checkoutUrl.url;
  }
}
