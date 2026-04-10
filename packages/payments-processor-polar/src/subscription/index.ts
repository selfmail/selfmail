import type { Polar } from "@polar-sh/sdk";

export class PolarSubscription {
  polar: Polar;
  constructor(polarClient: Polar) {
    this.polar = polarClient;
  }
}
