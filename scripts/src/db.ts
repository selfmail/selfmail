import { db } from "database";

try {
	await db.permission.createMany({
		data: [
			// payments permissions
			{
				name: "payments:read",
			},
			{
				name: "payments:write",
			},
			{
				name: "payments:delete",
			},
			{
				name: "payments:update",
			},

			// address permissions
			{
				name: "address:create",
			},

			// manage members permissions
			{
				name: "members:read",
			},
			{
				name: "members:invite",
			},
			{
				name: "members:remove",
			},

			// manage domains permissions
			{
				name: "domains:add",
			},
			{
				name: "domains:delete",
			},
			{
				// for example create a new verification token
				name: "domains:update",
			},

			// activities
			{
				name: "activities:read",
			},
			{
				name: "activities:delete",
			},
			{
				name: "activities:see-all",
			},

			// settings
			{
				name: "settings:update-workspace",
			},
			{
				name: "settings:delete",
			},
		],
	});
} catch (e) {
	console.error("Permissions seeding failed:", e);
}

try {
	await db.plan.createMany({
		data: [
			{
				name: "Free",
				maxSeats: 1,
				description: "Free plan with basic features",
				storageBytesPerSeat: 10 * 1024 * 1024 * 1024, // 10 GB
				addressesPerSeat: 2,
				domainsPerSeat: 1,
			},
			{
				name: "Premium",
				storageBytesPerSeat: 200 * 1024 * 1024 * 1024, // 200 GB
				description: "Premium plan with advanced features for a growing team.",
				addressesPerSeat: 15,
				domainsPerSeat: 2,
				maxSeats: null,
				access: {
					set: ["AI", "API", "PrioritySupport", "WORKFLOWS"],
				},
				stripeProductId: process.env.STRIPE_PREMIUM_PRODUCT_ID || undefined,
			},
		],
	});
} catch (e) {
	console.error("Plans seeding failed:", e);
}
