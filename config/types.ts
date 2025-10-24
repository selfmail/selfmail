export type Pricing = {
	plans: {
		[key: string]: {
			dbId: string;
			/**Expecting name to be the same as the object key for the plan. */
			name: string;
		};
	};
	defaultPlan: {
		name: string;
		dbId: string;
	};
};
