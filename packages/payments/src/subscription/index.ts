import { audit } from "@selfmail/audit";
import { db } from "@selfmail/db";
import type { PaymentsProcessorPolar } from "@selfmail/payments-processor-polar";
import { permissions } from "@selfmail/permissions";
export class Subscription {
  private readonly paymentsProcessor: PaymentsProcessorPolar;
  private readonly workspaceId: string;

  constructor({
    paymentProcessor,
    workspaceId,
  }: {
    workspaceId: string;
    paymentProcessor: PaymentsProcessorPolar;
  }) {
    this.paymentsProcessor = paymentProcessor;
    this.workspaceId = workspaceId;
  }

  async getSubscription() {
    // Get workspace subscription from database
    const subscription = await db.billingSubscription.findUnique({
      where: {
        workspaceId: this.workspaceId,
      },
    });

    if (!subscription) {
      return null;
    }

    return subscription;
  }

  async joinSeatBasedSubscription({ memberId }: { memberId: string }) {
    const member = await db.member.findUniqueOrThrow({
      where: {
        id: memberId,
        workspaceId: this.workspaceId,
      },
      select: {
        user: {
          select: {
            email: true,
          },
        },
        workspace: {
          select: {
            BillingSubscription: {
              select: {
                polarSubscriptionId: true,
              },
            },
          },
        },
      },
    });

    if (!member.workspace.BillingSubscription) {
      throw new Error("Workspace does not have a subscription");
    }

    // Check whether workspace has more than one seat
    await this.paymentsProcessor.seats.joinSeatBasedSubscription({
      memberId,
      memberEmail: member.user.email,
      subscriptionId: member.workspace.BillingSubscription.polarSubscriptionId,
    });

    await audit({
      action: "billing.plan_changed",
      actor: {
        type: "system",
      },
      tenantId: this.workspaceId,
      metadata: {
        memberId,
      },
    });
  }

  async leaveSeatBasedSubscription({ memberId }: { memberId: string }) {
    const member = await db.member.findUniqueOrThrow({
      where: {
        id: memberId,
        workspaceId: this.workspaceId,
      },
      select: {
        workspace: {
          select: {
            BillingSubscription: {
              select: {
                polarSubscriptionId: true,
              },
            },
          },
        },
      },
    });

    if (!member.workspace.BillingSubscription) {
      throw new Error("Workspace does not have a subscription");
    }

    // Check whether workspace has more than one seat
    await this.paymentsProcessor.seats.leaveSeatBasedSubscription({
      externalMemberId: memberId,
      subscriptionId: member.workspace.BillingSubscription.polarSubscriptionId,
    });

    await audit({
      action: "workspace.member_left",
      actor: {
        type: "system",
      },
      tenantId: this.workspaceId,
      metadata: {
        memberId,
      },
    });
    await audit({
      action: "billing.plan_changed",
      actor: {
        type: "system",
      },
      tenantId: this.workspaceId,
      metadata: {
        memberId,
      },
    });
  }

  async cancelSubscription() {}

  async createSubscription() {}

  async createCheckout({
    memberId,
    successUrl,
    returnUrl,
  }: {
    memberId: string;
    successUrl: string;
    returnUrl: string;
  }) {
    const p = await permissions({
      memberId,
      workspaceId: this.workspaceId,
      permissions: ["billings:update"],
    });

    if (!p.includes("billings:update")) {
      throw new Error("Member does not have permission to create checkout");
    }

    // Fetch workspace owner
    const owner = await db.member.findUniqueOrThrow({
      where: {
        id: memberId,
        workspaceId: this.workspaceId,
      },
      select: {
        workspace: {
          select: {
            owner: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    const checkout = await this.paymentsProcessor.subscription.createCheckout({
      customerEmail: owner.workspace.owner.email,
      includeTrial: true,
      productId: "",
      seats: 1,
      returnBackUrl: returnUrl,
      successUrl,
      externalCustomerId: this.workspaceId,
      subscriptionId: "",
      metadata: {
        createdByMemberId: memberId,
      },
    });

    await db.billingCheckout.create({
      data: {
        polarCheckoutId: checkout.checkoutId,
        workspaceId: this.workspaceId,
        createdByMemberId: memberId,
        seats: 1,
        plan: "BASIC",
        status: "PENDING",
        url: checkout.url,
      },
    });

    await audit({
      tenantId: this.workspaceId,
      actor: {
        type: "admin",
      },
      action: "billing.checkout_created",
      metadata: {
        memberId,
      },
    });

    return {
      url: checkout.url,
      checkoutId: checkout.checkoutId,
    };
  }
}
