import { db, type Prisma } from "@selfmail/db";
import type {
  PaymentsProcessorPolar,
  PolarWebhookPayload,
} from "@selfmail/payments-processor-polar";

type BillingPlan = "FREE" | "BASIC";
type BillingConfig = Record<"basicProductId" | "freeProductId", string>;
type CustomerState = Awaited<
  ReturnType<PaymentsProcessorPolar["customers"]["getStateByExternalId"]>
>;
type ActiveSubscription = CustomerState["activeSubscriptions"][number];
type ActiveBenefit = CustomerState["grantedBenefits"][number];

export class Billing {
  paymentProcessor: PaymentsProcessorPolar;
  config: BillingConfig;

  constructor(
    paymentProcessor: PaymentsProcessorPolar,
    config = readBillingConfig()
  ) {
    this.paymentProcessor = paymentProcessor;
    this.config = config;
  }

  async createFreePlanSubscription({
    memberId,
    workspaceId,
  }: {
    memberId: string;
    workspaceId: string;
  }) {
    const existing = await db.billingSubscription.findUnique({
      where: { workspaceId },
    });

    if (existing) {
      return existing;
    }

    const workspace = await getWorkspaceBillingContext({
      memberId,
      workspaceId,
    });
    const customer =
      await this.paymentProcessor.customers.upsertWorkspaceCustomer({
        email: workspace.owner.email,
        name: workspace.owner.name,
        workspaceId,
        workspaceName: workspace.name,
      });

    await upsertBillingCustomer({
      customer,
      workspaceId,
    });

    const subscription =
      await this.paymentProcessor.subscription.createFreePlanSubscription({
        customerId: customer.id,
        externalCustomerId: workspaceId,
        productId: requireProductId(this.config.freeProductId, "free"),
      });

    return db.billingSubscription.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        polarCustomerId: subscription.polarCustomerId,
        polarProductId: subscription.productId,
        polarSubscriptionId: subscription.subscriptionId,
        plan: "FREE",
        status: subscription.subscriptionStatus,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      update: {
        polarCustomerId: subscription.polarCustomerId,
        polarProductId: subscription.productId,
        polarSubscriptionId: subscription.subscriptionId,
        plan: "FREE",
        status: subscription.subscriptionStatus,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    });
  }

  async upgradeSubscriptionToBasicPaidPlan({
    returnBackUrl,
    subscriptionId,
    successUrl,
    memberId,
    workspaceId,
    seats = 1,
  }: {
    memberId: string;
    workspaceId: string;
    subscriptionId: string;
    successUrl: string;
    returnBackUrl: string;
    seats?: number;
  }) {
    const workspace = await getWorkspaceBillingContext({
      memberId,
      workspaceId,
    });
    await this.ensureWorkspaceCustomer({ memberId, workspaceId });

    const checkout =
      await this.paymentProcessor.subscription.upgradeToPaidSubscription({
        productId: requireProductId(this.config.basicProductId, "basic"),
        subscriptionId,
        customerEmail: workspace.owner.email,
        externalCustomerId: workspaceId,
        seats,
        successUrl,
        returnBackUrl,
        includeTrial: false,
        metadata: {
          memberId,
          seats,
          workspaceId,
        },
      });

    await db.billingCheckout.upsert({
      where: { polarCheckoutId: checkout.checkoutId },
      create: {
        workspaceId,
        polarCheckoutId: checkout.checkoutId,
        plan: "BASIC",
        status: checkout.status,
        seats,
        url: checkout.url,
        createdByMemberId: memberId,
      },
      update: {
        status: checkout.status,
        seats,
        url: checkout.url,
      },
    });

    return checkout.url;
  }

  async createCustomerPortalUrl({
    memberId,
    returnUrl,
    workspaceId,
  }: {
    memberId: string;
    returnUrl?: string;
    workspaceId: string;
  }) {
    await getWorkspaceBillingContext({ memberId, workspaceId });
    await this.ensureWorkspaceCustomer({ memberId, workspaceId });

    const session =
      await this.paymentProcessor.portal.createCustomerPortalSession({
        externalCustomerId: workspaceId,
        externalMemberId: memberId,
        returnUrl,
      });

    return session.customerPortalUrl;
  }

  async syncWorkspaceBillingState(workspaceId: string) {
    const state =
      await this.paymentProcessor.customers.getStateByExternalId(workspaceId);

    return this.saveCustomerState(state);
  }

  async handlePolarWebhook({
    body,
    headers,
  }: {
    body: string | Buffer;
    headers: Headers | Record<string, string>;
  }) {
    const payload = this.paymentProcessor.webhooks.validate({ body, headers });
    const eventId = getWebhookEventId(headers);

    if (!eventId) {
      throw new Error("Polar webhook id is required");
    }

    const existing = await db.billingWebhookEvent.findUnique({
      where: { polarEventId: eventId },
    });

    if (existing) {
      return { eventId, processed: false as const, type: existing.type };
    }

    const workspaceId = getWorkspaceIdFromPayload(payload);

    if (payload.type === "customer.state_changed") {
      await this.saveCustomerState(payload.data);
    }

    await db.billingWebhookEvent.create({
      data: {
        polarEventId: eventId,
        type: payload.type,
        workspaceId,
        payload: toJson(payload),
      },
    });

    return { eventId, processed: true as const, type: payload.type };
  }

  async hasEntitlement({
    key,
    workspaceId,
  }: {
    key: string;
    workspaceId: string;
  }) {
    const entitlement = await db.billingEntitlement.findUnique({
      where: {
        workspaceId_key: {
          key,
          workspaceId,
        },
      },
      select: {
        active: true,
      },
    });

    return entitlement?.active ?? false;
  }

  private async ensureWorkspaceCustomer({
    memberId,
    workspaceId,
  }: {
    memberId: string;
    workspaceId: string;
  }) {
    const existing = await db.billingCustomer.findUnique({
      where: { workspaceId },
    });

    if (existing) {
      return existing;
    }

    const workspace = await getWorkspaceBillingContext({
      memberId,
      workspaceId,
    });
    const customer =
      await this.paymentProcessor.customers.upsertWorkspaceCustomer({
        email: workspace.owner.email,
        name: workspace.owner.name,
        workspaceId,
        workspaceName: workspace.name,
      });

    return upsertBillingCustomer({
      customer,
      workspaceId,
    });
  }

  private async saveCustomerState(state: CustomerState) {
    const workspaceId = state.externalId;

    if (!workspaceId) {
      throw new Error("Polar customer state is missing external id");
    }

    const subscription = state.activeSubscriptions[0];
    const activeEntitlements = state.grantedBenefits.map((benefit) =>
      getBenefitKey(benefit)
    );

    await upsertBillingCustomer({
      customer: state,
      workspaceId,
    });

    if (subscription) {
      await db.billingSubscription.upsert({
        where: { workspaceId },
        create: mapSubscription({
          polarCustomerId: state.id,
          subscription,
          workspaceId,
          basicProductId: requireProductId(this.config.basicProductId, "basic"),
        }),
        update: mapSubscription({
          polarCustomerId: state.id,
          subscription,
          workspaceId,
          basicProductId: requireProductId(this.config.basicProductId, "basic"),
        }),
      });
    } else {
      await db.billingSubscription.updateMany({
        where: { workspaceId },
        data: {
          status: "inactive",
        },
      });
    }

    await Promise.all(
      state.grantedBenefits.map((benefit) =>
        db.billingEntitlement.upsert({
          where: {
            workspaceId_key: {
              key: getBenefitKey(benefit),
              workspaceId,
            },
          },
          create: {
            workspaceId,
            key: getBenefitKey(benefit),
            polarBenefitId: benefit.benefitId,
            active: true,
            metadata: toJson(benefit.benefitMetadata),
          },
          update: {
            polarBenefitId: benefit.benefitId,
            active: true,
            metadata: toJson(benefit.benefitMetadata),
          },
        })
      )
    );

    await db.billingEntitlement.updateMany({
      where: {
        workspaceId,
        key: {
          notIn: activeEntitlements,
        },
      },
      data: {
        active: false,
      },
    });

    return db.billingSubscription.findUnique({
      where: { workspaceId },
    });
  }
}

const getWorkspaceBillingContext = async ({
  memberId,
  workspaceId,
}: {
  memberId: string;
  workspaceId: string;
}) => {
  const workspace = await db.workspace.findFirst({
    where: {
      id: workspaceId,
      Member: {
        some: {
          id: memberId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      owner: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  if (!workspace.owner.email) {
    throw new Error("Workspace owner email is required");
  }

  return workspace;
};

const readBillingConfig = (): BillingConfig => {
  const freeProductId =
    process.env.POLAR_FREE_PRODUCT_ID || process.env.POLAR_PRODUCT_ID || "";
  const basicProductId =
    process.env.POLAR_BASIC_PRODUCT_ID || process.env.POLAR_PRODUCT_ID || "";

  return {
    basicProductId,
    freeProductId,
  };
};

const requireProductId = (productId: string, plan: string) => {
  if (!productId) {
    throw new Error(`Polar ${plan} product id is required`);
  }

  return productId;
};

const upsertBillingCustomer = ({
  customer,
  workspaceId,
}: {
  customer: {
    email?: string | null;
    externalId?: string | null;
    id: string;
    name: string | null;
    type: string;
  };
  workspaceId: string;
}) =>
  db.billingCustomer.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      polarCustomerId: customer.id,
      polarExternalId: customer.externalId || workspaceId,
      type: customer.type,
      email: customer.email,
      name: customer.name,
    },
    update: {
      polarCustomerId: customer.id,
      polarExternalId: customer.externalId || workspaceId,
      type: customer.type,
      email: customer.email,
      name: customer.name,
    },
  });

const mapSubscription = ({
  basicProductId,
  polarCustomerId,
  subscription,
  workspaceId,
}: {
  basicProductId: string;
  polarCustomerId: string;
  subscription: ActiveSubscription;
  workspaceId: string;
}) => ({
  workspaceId,
  polarSubscriptionId: subscription.id,
  polarCustomerId,
  polarProductId: subscription.productId,
  plan: getPlanFromProductId({
    basicProductId,
    productId: subscription.productId,
  }),
  status: subscription.status,
  seats: getSubscriptionSeats(subscription),
  amount: subscription.amount,
  currency: subscription.currency,
  currentPeriodStart: subscription.currentPeriodStart,
  currentPeriodEnd: subscription.currentPeriodEnd,
  trialStart: subscription.trialStart,
  trialEnd: subscription.trialEnd,
  cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  canceledAt: subscription.canceledAt,
  startedAt: subscription.startedAt,
  endsAt: subscription.endsAt,
  metadata: toJson(subscription.metadata),
});

const getPlanFromProductId = ({
  basicProductId,
  productId,
}: {
  basicProductId: string;
  productId: string;
}): BillingPlan => (productId === basicProductId ? "BASIC" : "FREE");

const getSubscriptionSeats = (subscription: ActiveSubscription) => {
  const seats = subscription.metadata.seats;
  return typeof seats === "number" ? seats : null;
};

const getBenefitKey = (benefit: ActiveBenefit) => {
  const key = benefit.benefitMetadata.key;

  if (typeof key === "string" && key.length > 0) {
    return key;
  }

  return benefit.benefitId;
};

const getWorkspaceIdFromPayload = (payload: PolarWebhookPayload) => {
  if (
    "externalId" in payload.data &&
    typeof payload.data.externalId === "string"
  ) {
    return payload.data.externalId;
  }

  if (
    "metadata" in payload.data &&
    typeof payload.data.metadata.workspaceId === "string"
  ) {
    return payload.data.metadata.workspaceId;
  }

  return null;
};

const getWebhookEventId = (headers: Headers | Record<string, string>) => {
  if (headers instanceof Headers) {
    return headers.get("webhook-id") || headers.get("Webhook-Id");
  }

  return headers["webhook-id"] || headers["Webhook-Id"] || null;
};

const toJson = (value: unknown) =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
