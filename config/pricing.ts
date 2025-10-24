import type { Pricing } from "./types";

export const pricingConfig: Pricing = {
	plans: {
		free: {
			name: "free",
			dbId: "53f841f1-7e5d-48c1-9e5d-ccb310543b44",
		},
		premium: {
			name: "premium",
			dbId: "54de4511-279b-4e85-a2e3-4ab8bfe43794",
		},
	},
	defaultPlan: {
		name: "free",
		dbId: "53f841f1-7e5d-48c1-9e5d-ccb310543b44",
	},
};
