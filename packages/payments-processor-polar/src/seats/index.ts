import type { Polar } from "@polar-sh/sdk";

export class PolarSeats {
  polar: Polar;

  constructor(polarClient: Polar) {
    this.polar = polarClient;
  }

  async leaveSeatBasedSubscription({
    customerId,
    seatId,
    subscriptionId,
  }: {
    seatId: string;
    customerId: string;
    seats: number;
    subscriptionId: string;
  }) {
    await this.polar.customerSeats.revokeSeat({
      seatId,
    });

    await this.polar.customers.delete({
      id: customerId,
    });

    // Seat is now unassigned, but still exists

    // Get seats of subscription
    const subscription = await this.polar.subscriptions.get({
      id: subscriptionId,
    });

    if (!subscription.seats) {
      throw new Error("Subscription does not have seats");
    }

    // Reduce subscription quantity by 1
    await this.polar.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        seats: subscription.seats - 1,
      },
    });
  }

  async joinSeatBasedSubscription({
    subscriptionId,
    ownerEmail,
    memberId,
  }: {
    subscriptionId: string;
    memberId: string;
    ownerEmail: string;
  }) {
    // create customer
    const customer = await this.polar.customers.create({
      type: "team",
      owner: {
        email: ownerEmail,
      },
    });

    // Create new seat for customer in subscription
    const subscription = await this.polar.subscriptions.get({
      id: subscriptionId,
    });

    if (!subscription.seats) {
      throw new Error("Subscription does not have seats");
    }

    await this.polar.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        seats: subscription.seats + 1,
      },
    });

    const seat = await this.polar.customerSeats.assignSeat({
      subscriptionId,
      customerId: customer.id,
      memberId,
    });

    return seat;
  }
}
