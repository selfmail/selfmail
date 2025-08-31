import { simpleParser } from "mailparser";
import { Logs } from "services/logs";
import { Queue } from "services/queue";
import { Spam } from "services/spam";
import type { SMTPServerDataStream, SMTPServerSession } from "smtp-server";

export async function data(
	stream: SMTPServerDataStream,
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	try {
		const s = stream.on("end", () => {
			if (s.sizeExceeded) {
				Logs.error("Message too large.");

				const err = Object.assign(new Error("Message too large"), {
					responseCode: 552,
				});

				throw callback(err);
			}
		});

		Logs.log("Proceed with email sending. Checking mail for possible Spam.");

		const parsed = await simpleParser(s);

		const spam = await Spam.check(parsed);

		if (!spam.allow) {
			Logs.error("Message flagged as spam.");
			return callback(
				new Error("Mail was flagged as spam. Sending not possible."),
			);
		}

		await Queue.processOutbound(parsed);
	} catch (e) {
		return callback(new Error("We had an unknown error. Please try again."));
	}
	return callback();
}
