import { db } from "database";
import { Logs } from "./logs";

export abstract class Notify {
	static async notifyUser({
		title,
		message,
		type,
		...userOrMember
	}: {
		title: string;
		message: string;
		type: "info" | "warning" | "error";
	} & ({ userId: string } | { memberId: string })) {
		await db.notification
			.create({
				data: {
					title,
					message,
					type,
					...userOrMember,
				},
			})
			.catch(async (err) => {
				if (err) {
					await Logs.error("Failed to create notification", {
						title,
						message,
						type,
						...userOrMember,
						error: err?.message,
						stack: err?.stack,
					});
				}
			});
	}
}
