import { db } from "database";

async function seedPermissions() {
	console.log("Starting permission seeding...");

	const permissions = [
		{
			name: "credentials:create",
			description: "Create SMTP credentials for addresses",
		},
		{
			name: "credentials:read",
			description: "View SMTP credentials",
		},
		{
			name: "credentials:edit",
			description: "Edit and regenerate SMTP credentials",
		},
		{
			name: "credentials:delete",
			description: "Delete SMTP credentials",
		},
		// Add other common permissions
		{
			name: "workspace:invite",
			description: "Invite members to workspace",
		},
		{
			name: "workspace:edit",
			description: "Edit workspace settings",
		},
		{
			name: "workspace:delete",
			description: "Delete workspace",
		},
		{
			name: "workspace:leave",
			description: "Leave workspace",
		},
		{
			name: "workspace:kick",
			description: "Remove members from workspace",
		},
	];

	for (const permission of permissions) {
		try {
			const existingPermission = await db.permission.findUnique({
				where: { name: permission.name },
			});

			if (!existingPermission) {
				await db.permission.create({
					data: permission,
				});
				console.log(`✓ Created permission: ${permission.name}`);
			} else {
				console.log(`⚠ Permission already exists: ${permission.name}`);
			}
		} catch (error) {
			console.error(`✗ Error creating permission ${permission.name}:`, error);
		}
	}

	console.log("Permission seeding completed!");
}

// Run the script
seedPermissions()
	.catch((error) => {
		console.error("Error seeding permissions:", error);
		process.exit(1);
	})
	.finally(async () => {
		await db.$disconnect();
	});
