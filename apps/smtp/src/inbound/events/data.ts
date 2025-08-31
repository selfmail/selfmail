import { db } from "database";
import { simpleParser } from "mailparser";
import { Logs } from "services/logs";
import { Spam } from "services/spam";
import type { SMTPServerDataStream, SMTPServerSession } from "smtp-server";
import { Inbound } from "../service";

// 4. Handling function
export async function handleData(
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

		const parsed = await simpleParser(s);

		const addressId = await db.address.findUnique({
			where: {
				email: parsed?.from?.text || "",
			},
			select: {
				id: true,
			},
		});

		if (!addressId) return callback(new Error("Address not found"));

		const spam = await Spam.check(parsed);

		if (!spam.allow) {
			return callback(new Error("Email marked as spam"));
		}

		const save = await Inbound.save(
			parsed,
			addressId.id,
			spam.warning ?? undefined,
		);
		const saveToS3 = await Inbound.saveMailToS3(parsed);
		callback();
	} catch (error) {
		callback(error instanceof Error ? error : new Error(String(error)));
	}
}
