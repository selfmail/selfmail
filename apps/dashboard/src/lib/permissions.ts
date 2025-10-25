import { db } from "database";

export const permissions = async ({
	permissions,
	memberId,
	workspaceId,
}: {
	permissions: string[];
	memberId: string;
	workspaceId: string;
}): Promise<string[]> => {
	// Single optimized query to get all permissions for a member and workspace ownership info
	// This includes both direct permissions and role-based permissions
	const member = await db.member.findUnique({
		where: {
			id: memberId,
			workspaceId: workspaceId, // Ensure member belongs to the workspace
		},
		select: {
			userId: true, // Include userId to check workspace ownership
			// Direct member permissions
			MemberPermission: {
				select: {
					permissionName: true,
				},
				where: {
					permissionName: {
						in: permissions, // Only fetch the permissions we're checking
					},
				},
			},
			// Role-based permissions
			roles: {
				select: {
					RolePermission: {
						select: {
							permission: {
								select: {
									name: true,
								},
							},
						},
						where: {
							permission: {
								name: {
									in: permissions, // Only fetch the permissions we're checking
								},
							},
						},
					},
				},
			},
			// Include workspace owner information
			workspace: {
				select: {
					ownerId: true,
				},
			},
		},
	});

	if (!member) {
		return []; // Member not found or doesn't belong to workspace
	}

	// Check if the user is the owner of the workspace
	const isOwner = member.userId === member.workspace.ownerId;

	// If the user is the owner, they have all permissions
	if (isOwner) {
		return permissions;
	}

	// Collect all permissions (both direct and role-based)
	const userPermissions = new Set<string>();

	// Add direct permissions
	for (const permission of member.MemberPermission) {
		userPermissions.add(permission.permissionName);
	}

	// Add role-based permissions
	for (const role of member.roles) {
		for (const rolePermission of role.RolePermission) {
			userPermissions.add(rolePermission.permission.name);
		}
	}

	// Return only the permissions that were requested and the user has
	return permissions.filter((permission) => userPermissions.has(permission));
};

// Helper function to check if a user has specific permissions
export const hasPermissions = async ({
	permissions: permissionNames,
	memberId,
	workspaceId,
}: {
	permissions: string[];
	memberId: string;
	workspaceId: string;
}): Promise<boolean> => {
	// Check if user is workspace owner first
	const member = await db.member.findUnique({
		where: {
			id: memberId,
			workspaceId: workspaceId,
		},
		select: {
			userId: true,
			workspace: {
				select: {
					ownerId: true,
				},
			},
		},
	});

	if (!member) {
		return false; // Member not found or doesn't belong to workspace
	}

	// If the user is the owner of the workspace, they have all permissions
	if (member.userId === member.workspace.ownerId) {
		return true;
	}

	const userPermissions = await permissions({
		permissions: permissionNames,
		memberId,
		workspaceId,
	});

	// Check if user has ALL requested permissions
	return permissionNames.every((permission) =>
		userPermissions.includes(permission),
	);
};

// Helper function to check if a user has any of the specified permissions
export const hasAnyPermission = async ({
	permissions: permissionNames,
	memberId,
	workspaceId,
}: {
	permissions: string[];
	memberId: string;
	workspaceId: string;
}): Promise<boolean> => {
	// Check if user is workspace owner first
	const member = await db.member.findUnique({
		where: {
			id: memberId,
			workspaceId: workspaceId,
		},
		select: {
			userId: true,
			workspace: {
				select: {
					ownerId: true,
				},
			},
		},
	});

	if (!member) {
		return false; // Member not found or doesn't belong to workspace
	}

	// If the user is the owner of the workspace, they have all permissions
	if (member.userId === member.workspace.ownerId) {
		return true;
	}

	const userPermissions = await permissions({
		permissions: permissionNames,
		memberId,
		workspaceId,
	});

	// Check if user has ANY of the requested permissions
	return userPermissions.length > 0;
};
