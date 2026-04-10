import { db } from "@selfmail/db";
import type { PaymentsProcessorPolar } from "@selfmail/payments-processor-polar";

export class Subscription {
  paymentProcessor: PaymentsProcessorPolar;

  constructor(paymentProcessor: PaymentsProcessorPolar) {
    this.paymentProcessor = paymentProcessor;
  }

  async createFreePlanSubscription(
    userId: string,
    workspaceId: string,
    locale?: string
  ) {
    const user = await db.member.findUnique({
      where: {
        id: userId,
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
        userId,
        email: user.user.email,
        locale,
      });

    if (!subscription) {
      throw new Error("Failed to create subscription");
    }

    return subscription;
  }
}
