import type { AddressObject, ParsedMail } from "mailparser";
import { simpleParser } from "mailparser";
import { Logs } from "services/logs";
import { EmailQueue } from "services/queue";
import { Spam } from "services/spam";
import type { SMTPServerDataStream, SMTPServerSession } from "smtp-server";

// Helper function to transform AddressObject to OutboundEmail address format
function transformAddressObject(addr: AddressObject) {
	return {
		value: addr.value.map((email) => ({
			address: email.address || "",
			name: email.name,
		})),
		text: addr.text,
		html: addr.html,
	};
}

// Helper function to transform ParsedMail to OutboundEmail format
function transformParsedMailToOutbound(parsed: ParsedMail) {
	// Convert headers to a Map with compatible types
	const headerMap = new Map<string, string | string[] | Date>();

	if (parsed.headers) {
		for (const [key, value] of parsed.headers.entries()) {
			// Transform HeaderValue to compatible types
			if (typeof value === "string") {
				headerMap.set(key, value);
			} else if (value instanceof Date) {
				headerMap.set(key, value);
			} else if (Array.isArray(value)) {
				// Convert all array elements to strings
				headerMap.set(
					key,
					value.map((v) => String(v)),
				);
			} else if (value && typeof value === "object" && "text" in value) {
				// For AddressObject or similar, use the text representation
				headerMap.set(key, (value as { text: string }).text || String(value));
			} else {
				headerMap.set(key, String(value));
			}
		}
	}

	// Transform address objects
	const transformAddresses = (
		addr: AddressObject | AddressObject[] | undefined,
	) => {
		if (!addr) return undefined;
		if (Array.isArray(addr)) {
			return addr.map(transformAddressObject);
		}
		return transformAddressObject(addr);
	};

	return {
		subject: parsed.subject,
		text: parsed.text,
		html: parsed.html || undefined,
		to: transformAddresses(parsed.to),
		from: parsed.from ? transformAddressObject(parsed.from) : undefined,
		cc: transformAddresses(parsed.cc),
		bcc: transformAddresses(parsed.bcc),
		replyTo: parsed.replyTo
			? transformAddressObject(parsed.replyTo)
			: undefined,
		messageId: parsed.messageId,
		inReplyTo: parsed.inReplyTo,
		references: parsed.references,
		date: parsed.date?.toISOString(),
		priority: "normal" as const,
		textAsHtml: parsed.textAsHtml,
		attachments: parsed.attachments || [],
		headers: headerMap,
		headerLines: parsed.headerLines ? [...parsed.headerLines] : [],
	};
}

export async function data(
	stream: SMTPServerDataStream,
	_session: SMTPServerSession,
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

		await EmailQueue.processOutbound(transformParsedMailToOutbound(parsed));
	} catch (_e) {
		return callback(new Error("We had an unknown error. Please try again."));
	}
	return callback();
}
