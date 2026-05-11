import type { Polar } from "@polar-sh/sdk";
import type { Customer } from "@polar-sh/sdk/models/components/customer.js";
import type { CustomerState } from "@polar-sh/sdk/models/components/customerstate.js";

export class PolarCustomers {
  polar: Polar;

  constructor(polarClient: Polar) {
    this.polar = polarClient;
  }

  async getByExternalId(externalId: string): Promise<Customer | null> {
    try {
      return await this.polar.customers.getExternal({ externalId });
    } catch {
      return null;
    }
  }

  async getStateByExternalId(externalId: string): Promise<CustomerState> {
    return await this.polar.customers.getStateExternal({ externalId });
  }

  async upsertWorkspaceCustomer({
    email,
    name,
    workspaceId,
    workspaceName,
  }: {
    email: string;
    name?: string | null;
    workspaceId: string;
    workspaceName: string;
  }): Promise<Customer> {
    const customer = await this.getByExternalId(workspaceId);

    if (customer) {
      return this.polar.customers.updateExternal({
        externalId: workspaceId,
        customerUpdateExternalID: {
          email,
          name: workspaceName,
          metadata: {
            workspaceId,
          },
        },
      });
    }

    return this.polar.customers.create({
      type: "team",
      email,
      externalId: workspaceId,
      name: workspaceName,
      owner: {
        email,
        name: name || undefined,
      },
      metadata: {
        workspaceId,
      },
    });
  }
}
