import type { SMTPServerSession } from "smtp-server";
import type { Callback } from "../types";

export abstract class Connect {
	static async init(session: SMTPServerSession, callback: Callback) {
		try {
			// TODO: implement logic to check for any spam patterns
		} catch (error) {
			// FIXME: handle error properly
		}
	}
}
