import { db } from "database";
import { type Cookie, status } from "elysia";

export abstract class Authentication {
	static async login() {}
	static async logout(cookie: Cookie<null>) {
		cookie.remove();
	}

	// session utils

	/**
	 * Returns whether the user is authorized or not. It also checks provided permissions for the user.
	 */
	static async authorize(memberId: string, permissions?: string[]) {
		const member = await db.member.findUnique({
			where: {
				id: memberId,
			},
			select: {
				MemberPermission: {
					where: {
						memberId,
						permissionId: {
							in: permissions,
						},
					},
					select: {
						permissionId: true,
					},
				},
			},
		});

		if (!member?.MemberPermission) return false;
		if (!permissions) return true;

		if (member.MemberPermission.length !== permissions.length) return false;

		return true;
	}

	/**
	 * Encrypts the given session cookie, checks if the session is correct, checks for
	 * possible permissions and returns whether the user exists and if the user is authorized
	 * to proceed.
	 */
	static async checkAuth(cookie: Cookie<any>, permissions?: string[]) {}

	// manage permissions and roles
	static async grantPermission(memberId: string, permissionId: string) {
		if (await Authentication.searchPermission(memberId, permissionId)) return;

		await db.memberPermission.create({
			data: {
				memberId,
				permissionId,
			},
		});
	}

	static async searchPermission(memberId: string, permissionId: string) {
		const permission = await db.memberPermission.findUnique({
			where: {
				memberId_permissionId: {
					memberId,
					permissionId,
				},
			},
		});

		return !!permission;
	}

	static async grantRole(memberId: string, roleId: string) {
		const rolePermissions = (
			await db.member.update({
				where: {
					id: memberId,
				},
				data: {
					roles: {
						connect: {
							id: roleId,
						},
					},
				},
				select: {
					roles: {
						where: {
							id: roleId,
						},
						select: {
							RolePermission: {
								where: {
									roleId,
								},
								select: {
									permissionId: true,
								},
							},
						},
					},
				},
			})
		).roles[0].RolePermission;

		if (!rolePermissions) throw status(404, "Member or role not found");

		const permissions = await db.memberPermission.createMany({
			data: rolePermissions.map((p) => ({
				permissionId: p.permissionId,
				memberId,
			})),
		});
	}

	static async createRole({
		name,
		description,
		permissions,
		workspaceId,
	}: {
		name: string;
		description?: string;
		permissions: string[];
		workspaceId: string;
	}) {
		const role = await db.role.create({
			data: {
				name,
				description,
				workspaceId,
			},
		});

		const data = permissions.map((p) => ({
			roleId: role.id,
			permissionId: p,
		}));

		const rolePermissions = await db.rolePermission.createMany({
			data,
		});
	}

	// remove permissions and roles
	static async removePermission(memberId: string, permissionId: string) {
		await db.memberPermission.delete({
			where: {
				memberId_permissionId: {
					memberId,
					permissionId,
				},
			},
		});
	}
	/**
	 * Removes the role from the user **AND** the permissions, which comes from the role.
	 */
	static async removeRole(memberId: string, roleId: string) {
		const permissions = (
			await db.role.findUnique({
				where: {
					id: roleId,
				},
				select: {
					RolePermission: true,
				},
			})
		)?.RolePermission;

		if (!permissions) {
			throw status(404, "No role found");
		}

		for await (const permission of permissions) {
			await db.memberPermission.delete({
				where: {
					memberId_permissionId: {
						memberId,
						permissionId: permission.permissionId,
					},
				},
			});
		}
	}
}
