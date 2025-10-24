import type { Pricing } from "./types";

export const pricingConfig: Pricing = {
	plans: {
		free: {
			name: "free",
			dbId: "free",
		},
		premium: {
			name: "premium",
			dbId: "premium",
		},
	},
	defaultPlan: {
		name: "free",
		dbId: "free",
	},
};
