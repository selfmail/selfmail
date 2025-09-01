import { db } from "database";
import { status } from "elysia";
import type { DashboardModule } from "./module";

export abstract class DashboardService {
	static async multipleEmails(
		{ limit, page }: DashboardModule.EmailsQuery,
		memberId: string,
		workspaceId: string,
	) {
		page = Number(page) || 1;
		limit = Number(limit) || 20;

		// Get user's accessible addresses through member addresses
		const memberAddresses = await db.memberAddress.findMany({
			where: {
				member: {
					id: memberId,
					workspaceId,
				},
			},
			select: { addressId: true },
		});

		const addressIds = memberAddresses.map((ma) => ma.addressId);

		if (addressIds.length < 0) {
			return {
				emails: [],
				totalCount: 0,
				page,
				limit,
				totalPages: 0,
			};
		}

		// Only fetch emails for the user's accessible addresses
		const emails = await db.email.findMany({
			where: {
				addressId: {
					in: addressIds,
				},
			},
			take: limit,
			skip: (page - 1) * limit,
			orderBy: {
				date: "desc",
			},
		});

		const totalCount = await db.email.count({
			where:
				addressIds.length > 0
					? {
							addressId: {
								in: addressIds,
							},
						}
					: undefined,
		});

		return {
			emails,
			totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit),
		};
	}

	static async singleEmail(
		{ id }: DashboardModule.SingleEmailParams,
		userId: string,
	) {
		// Get user's accessible addresses through member addresses
		const memberAddresses = await db.memberAddress.findMany({
			where: {
				member: {
					userId: userId,
				},
			},
			select: { addressId: true },
		});

		const addressIds = memberAddresses.map((ma) => ma.addressId);

		const email = await db.email.findFirst({
			where: {
				id,
				...(addressIds.length > 0
					? {
							addressId: {
								in: addressIds,
							},
						}
					: {}),
			},
		});

		if (!email) {
			throw status(404, "Email not found");
		}

		return email;
	}

	static async userAddresses(memberId: string) {
		const addresses = await db.memberAddress.findMany({
			where: {
				memberId,
			},
			include: {
				address: {
					select: {
						id: true,
						email: true,
						MemberAddress: {
							include: {
								member: {
									select: {
										id: true,
										profileName: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!addresses) {
			return status(404, "No addresses found for this user");
		}

		// map addresses for a simple object array
		return addresses.map((address) => ({
			id: address.address.id,
			email: address.address.email,
			access: address.address.MemberAddress.map((ma) => ({
				id: ma.member.id,
				profileName: ma.member.profileName,
			})),
		}));
	}

	static async markEmailAsRead(
		emailId: string,
		read: boolean,
		memberId: string,
		workspaceId: string,
	) {
		// Get user's accessible addresses through member addresses
		const memberAddresses = await db.memberAddress.findMany({
			where: {
				member: {
					id: memberId,
					workspaceId,
				},
			},
			select: { addressId: true },
		});

		const addressIds = memberAddresses.map((ma) => ma.addressId);

		// First verify the user has access to this email
		const email = await db.email.findFirst({
			where: {
				id: emailId,
				addressId: {
					in: addressIds,
				},
			},
		});

		if (!email) {
			throw status(404, "Email not found or access denied");
		}

		// Update the read status
		const updatedEmail = await db.email.update({
			where: {
				id: emailId,
			},
			data: {
				read,
				readAt: read ? new Date() : null,
			},
		});

		return {
			success: true,
			email: {
				id: updatedEmail.id,
				read: updatedEmail.read,
				readAt: updatedEmail.readAt,
			},
		};
	}
}
