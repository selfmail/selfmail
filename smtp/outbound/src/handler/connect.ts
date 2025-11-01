import { Ratelimit } from "services";
import type { SMTPServerSession } from "smtp-server";
import type { Callback } from "../types";

export abstract class Connect {
	static async init(session: SMTPServerSession, callback: Callback) {
		try {
			// Check for ratelimiting
			const { success } = await Ratelimit.limit(
				session.remoteAddress || "unknown",
				{
					max: 60,
					windowInSeconds: 60,
				},
			);

			if (!success) {
				console.error(
					`[Connect] Ratelimit exceeded for IP: ${session.remoteAddress}`,
				);
				return callback(
					new Error("421 4.7.0 Too many connections, please try again later"),
				);
			}

			// Check for Spam Connection
			// TODO: implement spam connection check

			return callback();
		} catch (error) {
			console.error(`[Connect] Error during connection handling: ${error}`);
			return callback(new Error("Connection rejected due to server error"));
		}
	}
}
