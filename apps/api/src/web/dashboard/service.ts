import { db } from "database";
import { status } from "elysia";
import type { DashboardModule } from "./module";

// biome-ignore lint/complexity/noStaticOnlyClass: This class is designed to be static and does not require instantiation.
export abstract class DashboardService {
	static async multipleEmails({ limit, page }: DashboardModule.EmailsQuery) {
		page = Number(page) || 1;
		limit = Number(limit) || 20;

		const emails = await db.email.findMany({
			take: limit,
			skip: (page - 1) * limit,
		});

		const totalCount = await db.email.count();

		return {
			emails,
			totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit),
		};
	}
	static async singleEmail({ id }: DashboardModule.SingleEmailParams) {
		const email = await db.email.findUnique({
			where: { id },
		});

		if (!email) {
			throw status(404, "Email not found");
		}

		return email;
	}
}
