import { db } from "database";

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

		// workspace
		{
			name: "workspace:delete",
		},

		// settings
		{
			name: "workspace:update-icon",
		},
		{
			name: "workspace:update-name",
		},
		{
			name: "workspace:update-description",
		},
	],
});

await db.plan.createMany({
	data: [
		{
			name: "free",
			priceEuroCents: 0,
			storageBytes: 5 * 1024 * 1024 * 1024, // 5 GB
			maxMembers: 1,
			softBytesMemberLimit: 5 * 1024 * 1024 * 1024,
		},
		{
			name: "pro",
			priceEuroCents: 2500, // 25 EUR
			storageBytes: 100 * 1024 * 1024 * 1024, // 100 GB
			maxMembers: 3,
			softBytesMemberLimit: 35 * 1024 * 1024 * 1024, // 35 GB
		},
		{
			name: "premium",
			priceEuroCents: 20000, // 200 EUR
			storageBytes: 1000 * 1024 * 1024 * 1024, // 1 TB
			maxMembers: 10,
			softBytesMemberLimit: 100 * 1024 * 1024 * 1024, // 100 GB
		},
	],
});
