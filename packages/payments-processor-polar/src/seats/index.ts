import type { Polar } from "@polar-sh/sdk";

export class PolarSeats {
  private readonly polar: Polar;

  constructor(polarClient: Polar) {
    this.polar = polarClient;
  }

  async leaveSeatBasedSubscription({
    externalMemberId,
    subscriptionId,
  }: {
    externalMemberId: string;
    subscriptionId: string;
  }) {
    const { seats } = await this.polar.customerSeats.listSeats({
      subscriptionId,
    });
    const seat = seats.find(
      ({ member, status }) =>
        member?.externalId === externalMemberId && status !== "revoked"
    );

    if (!seat) {
      throw new Error("Member does not have an active subscription seat");
    }

    await this.polar.customerSeats.revokeSeat({
      seatId: seat.id,
    });

    // Seat is now unassigned, but still exists

    // Get seats of subscription
    const subscription = await this.polar.subscriptions.get({
      id: subscriptionId,
    });

    if (!subscription.seats) {
      throw new Error("Subscription does not have seats");
    }

    // Reduce subscription seat quantity by 1
    await this.polar.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        seats: subscription.seats - 1,
      },
    });
  }

  async joinSeatBasedSubscription({
    subscriptionId,
    memberEmail,
    memberId,
  }: {
    subscriptionId: string;
    memberId: string;
    memberEmail: string;
  }) {
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
      email: memberEmail,
      externalMemberId: memberId,
      immediateClaim: true,
    });

    return seat;
  }
}
