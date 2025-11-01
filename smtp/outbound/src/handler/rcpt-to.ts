import type { SMTPServerAddress, SMTPServerSession } from "smtp-server";
import type { Callback } from "../types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export abstract class RcptTo {
	static async init(
		address: SMTPServerAddress,
		_session: SMTPServerSession,
		callback: Callback,
	): Promise<ReturnType<Callback>> {
		try {
			const email = address.address;

			if (!email || !EMAIL_REGEX.test(email)) {
				return callback(new Error("Invalid recipient email address"));
			}

			return callback();
		} catch (error) {
			console.error("Error in RCPT TO handler:", error);
			return callback(new Error("Temporary server error"));
		}
	}
}
