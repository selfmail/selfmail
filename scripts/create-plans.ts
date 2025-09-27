// Run this script, after the database is successfully set up

import { db } from "database";

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
