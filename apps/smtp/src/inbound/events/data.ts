import { simpleParser } from "mailparser";
import type { SMTPServerDataStream, SMTPServerSession } from "smtp-server";
import { client } from "@/lib/client";
import { createInboundLog } from "@/utils/logs";

const log = createInboundLog("data");

export async function handleData(
	stream: SMTPServerDataStream,
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	log(
		`Handle DATA Command for ${session.id}, remote address: ${session.remoteAddress || "unknown"}`,
	);

	try {
		// Parse the email from the stream
		const parsed = await simpleParser(stream);

		log(
			`Parsed email - From: ${parsed.from?.text}, To: ${
				Array.isArray(parsed.to) ? parsed.to[0]?.text : parsed.to?.text || ""
			}, Subject: ${parsed.subject}`,
		);

		// Extract email data
		const emailData = {
			messageId: parsed.messageId || "",
			from: parsed.from?.text || "",
			to: Array.isArray(parsed.to)
				? parsed.to.map((addr) => addr.text).join(", ")
				: parsed.to?.text || "",
			cc: Array.isArray(parsed.cc)
				? parsed.cc.map((addr) => addr.text).join(", ")
				: parsed.cc?.text || "",
			bcc: Array.isArray(parsed.bcc)
				? parsed.bcc.map((addr) => addr.text).join(", ")
				: parsed.bcc?.text || "",
			subject: parsed.subject || "",
			text: parsed.text || "",
			html: parsed.html || "",
			date: parsed.date || new Date(),
			attachments:
				parsed.attachments?.map((att) => ({
					filename: att.filename || "",
					contentType: att.contentType || "",
					size: att.size || 0,
					content: att.content?.toString("base64") || "",
				})) || [],
			headers: parsed.headers
				? Object.fromEntries(
						Object.entries(parsed.headers).map(([key, value]) => [
							key,
							Array.isArray(value) ? value.join(", ") : String(value),
						]),
					)
				: {},
			sessionId: session.id,
			remoteAddress: session.remoteAddress || "",
		};

		// Send to your API endpoint
		const res = await client.inbound.data.get({
			attachments: emailData.attachments,
			mailFrom: emailData.from,
			to: emailData.to,
			subject: emailData.subject,
			text: emailData.text,
			html: emailData.html,
		});

		log(
			`Email processed successfully for session ${session.id}, response: ${res.status}`,
		);

		// Call callback to indicate success
		callback();
	} catch (error) {
		log(`Error processing email for session ${session.id}: ${error}`);
		callback(error instanceof Error ? error : new Error(String(error)));
	}
}
