import { db } from "database";
import { status } from "elysia";
import type { DashboardModule } from "./module";

export abstract class DashboardService {
	static async multipleEmails(
		{ limit, page }: DashboardModule.EmailsQuery,
		userId: string,
	) {
		page = Number(page) || 1;
		limit = Number(limit) || 20;

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

		// Only fetch emails for the user's accessible addresses
		const emails = await db.email.findMany({
			where:
				addressIds.length > 0
					? {
							addressId: {
								in: addressIds,
							},
						}
					: undefined,
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
}
