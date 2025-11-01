import { db } from "database";
import type { SMTPServerAddress, SMTPServerSession } from "smtp-server";
import type { Callback } from "../types";

export abstract class MailFrom {
	static async init(
		address: SMTPServerAddress,
		_session: SMTPServerSession,
		callback: Callback,
	): Promise<ReturnType<Callback>> {
		try {
			// Extract the email address from the MAIL FROM command
			const email = address.address || "";

			// check whether the email belongs to us
			const emailAddress = await db.address.findUnique({
				where: {
					email,
				},
			});

			if (!emailAddress) {
				return callback(new Error("Invalid email address"));
			}

			return callback();
		} catch (error) {
			console.error("Error in MAIL FROM handler:", error);
			return callback(new Error("Temporary server error"));
		}
	}
}
