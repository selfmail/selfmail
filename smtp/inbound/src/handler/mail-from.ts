import type { SMTPServerAddress, SMTPServerSession } from "smtp-server";
import z from "zod";
import type { Callback } from "../types";

export abstract class MailFrom {
	static async init(
		address: SMTPServerAddress,
		session: SMTPServerSession,
		callback: (err?: Error) => void,
	): Promise<ReturnType<Callback>> {
		if (!address || !address.address) {
			console.warn("[MailFrom] Rejected: No email address provided");
			return callback(
				new Error("MAIL FROM rejected: No email address provided"),
			);
		}

		// Parsing email
		const parse = await z.email().safeParseAsync(address.address);

		if (!parse.success) {
			console.warn(
				`[MailFrom] Rejected: Invalid email address: ${address.address}`,
			);
			return callback(
				new Error(
					`MAIL FROM rejected: Invalid email address: ${address.address}`,
				),
			);
		}

		// Check whether the address is allowed to send emails from
	}
}
