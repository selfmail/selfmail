import { db } from "database";
import type { SMTPServerAddress } from "smtp-server";
import type { Callback } from "../types";
import type { ExtendedSession } from "../types/session";

export abstract class RcptTo {
	static async init(
		address: SMTPServerAddress,
		session: ExtendedSession,
		callback: (err?: Error) => void,
	): Promise<ReturnType<Callback>> {
		try {
			// Find receipient
			const recipient = await db.address.findUnique({
				where: {
					email: address.address.toLowerCase(),
				},
			});

			if (!recipient) {
				console.warn(
					`[RcptTo] Rejected: Recipient not found: ${address.address}`,
				);
				return callback(
					new Error(
						`RCPT TO rejected: Recipient not found: ${address.address}`,
					),
				);
			}

			console.log(`[RcptTo] Accepted RCPT TO: ${address.address}`);
			return callback();
		} catch (error) {
			console.error(
				`[RcptTo] Error processing RCPT TO ${address.address}: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			return callback(
				new Error(
					`RCPT TO processing error for ${address.address}: ${error instanceof Error ? error.message : "Unknown error"}`,
				),
			);
		}
	}
}
