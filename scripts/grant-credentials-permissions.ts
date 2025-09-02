import { db } from "database";

async function grantCredentialsPermissions() {
	console.log("Granting credentials permissions to workspace owners...");

	// Get all workspaces with their owners
	const workspaces = await db.workspace.findMany({
		include: {
			Member: true,
		},
	});

	// Get the credentials permissions
	const credentialsPermissions = await db.permission.findMany({
		where: {
			name: {
				in: [
					"credentials:create",
					"credentials:read",
					"credentials:edit",
					"credentials:delete",
				],
			},
		},
	});

	console.log(`Found ${credentialsPermissions.length} credentials permissions`);

	for (const workspace of workspaces) {
		console.log(`Processing workspace: ${workspace.name}`);

		// Find the owner member
		const ownerMember = await db.member.findFirst({
			where: {
				workspaceId: workspace.id,
				userId: workspace.ownerId,
			},
		});

		if (!ownerMember) {
			console.log(`⚠ No member found for workspace owner ${workspace.ownerId}`);
			continue;
		}

		// Grant each credentials permission to the owner
		for (const permission of credentialsPermissions) {
			try {
				const existingPermission = await db.memberPermission.findUnique({
					where: {
						memberId_permissionId: {
							memberId: ownerMember.id,
							permissionId: permission.id,
						},
					},
				});

				if (!existingPermission) {
					await db.memberPermission.create({
						data: {
							memberId: ownerMember.id,
							permissionId: permission.id,
						},
					});
					console.log(`✓ Granted ${permission.name} to workspace owner`);
				} else {
					console.log(`⚠ Permission ${permission.name} already granted`);
				}
			} catch (error) {
				console.error(`✗ Error granting permission ${permission.name}:`, error);
			}
		}
	}

	console.log("Permissions granted!");
}

// Run the script
grantCredentialsPermissions()
	.catch((error) => {
		console.error("Error granting permissions:", error);
		process.exit(1);
	})
	.finally(async () => {
		await db.$disconnect();
	});
