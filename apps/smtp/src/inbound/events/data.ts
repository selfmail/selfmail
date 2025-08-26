import { simpleParser } from "mailparser";
import type { SMTPServerDataStream, SMTPServerSession } from "smtp-server";
import { client } from "@/lib/client";
import { createInboundLog } from "@/utils/logs";
import { Parse } from "@/utils/parse";

const log = createInboundLog("data");

// 4. Handling function
export async function handleData(
	stream: SMTPServerDataStream,
	session: SMTPServerSession,
	callback: (err?: Error | null) => void,
): Promise<void> {
	log(
		`Handle DATA Command for ${session.id}, remote address: ${session.remoteAddress || "unknown"}`,
	);

	console.log(session);

	try {
		const s = stream.on("end", () => {
			if (s.sizeExceeded) {
				const err = Object.assign(new Error("Message too large"), {
					responseCode: 552,
				});
				throw callback(err);
			}
		});

		// Parse the email from the stream
		const parsed = await simpleParser(s);

		log(
			`Parsed email - From: ${parsed.from?.text}, To: ${
				Array.isArray(parsed.to) ? parsed.to[0]?.text : parsed.to?.text || ""
			}, Subject: ${parsed.subject}`,
		);

		// Parse and validate the email using our Parse utility
		const emailData = await Parse.inboundEmail(
			parsed,
			session.id,
			session.remoteAddress || undefined,
		);

		// Extract email addresses for spam checking
		const fromAddress =
			typeof emailData.from === "string"
				? emailData.from
				: emailData.from.address;

		const toAddress = Array.isArray(emailData.to)
			? emailData.to[0] &&
				(typeof emailData.to[0] === "string"
					? emailData.to[0]
					: emailData.to[0].address)
			: typeof emailData.to === "string"
				? emailData.to
				: emailData.to.address;

		if (!toAddress) {
			log("No valid recipient address found");
			return callback(new Error("No valid recipient address found"));
		}

		// Check for spam using rspamd
		log(
			`Checking email for spam using rspamd - From: ${fromAddress}, To: ${toAddress}`,
		);

		const spam = await client.inbound.spam.post({
			body: emailData.text || "",
			subject: emailData.subject,
			html: emailData.html || "",
			from: fromAddress,
			to: toAddress,
			attachments:
				emailData.attachments?.map((att) => {
					// Create a proper File object from the attachment for spam checking
					if (!att.content) {
						return new File([], att.filename || "unknown", {
							type: att.contentType || "application/octet-stream",
						});
					}

					const buffer = Buffer.from(att.content, "base64");
					const file = new File([buffer], att.filename || "unknown", {
						type: att.contentType || "application/octet-stream",
					});
					return file;
				}) || [],
		});

		if (spam.error) {
			log(`Spam check failed: ${JSON.stringify(spam.error)}`);
			const errorMessage =
				typeof spam.error.value === "string"
					? spam.error.value
					: `Spam check failed: ${JSON.stringify(spam.error)}`;
			return callback(new Error(errorMessage));
		}

		if (spam.data) {
			log(
				`Spam check completed - Score: ${spam.data.score}, Action: ${spam.data.action}`,
			);

			// If email is marked as spam/rejected, reject it
			if (spam.data.action === "reject" || spam.data.score > 5) {
				log(
					`Email rejected by spam filter - Score: ${spam.data.score}, Action: ${spam.data.action}`,
				);
				const err = Object.assign(new Error("Email rejected by spam filter"), {
					responseCode: 550,
				});
				return callback(err);
			}
		}

		// Process the email data
		log(`Processing email data for session ${session.id}`);

		const res = await client.inbound.data.post({
			attachments:
				emailData.attachments?.map((att) => {
					// Create proper File objects for the data endpoint
					if (!att.content) {
						return new File([], att.filename || "unknown", {
							type: att.contentType || "application/octet-stream",
						});
					}

					const buffer = Buffer.from(att.content, "base64");
					const file = new File([buffer], att.filename || "unknown", {
						type: att.contentType || "application/octet-stream",
					});
					return file;
				}) || [],
			mailFrom: fromAddress,
			to: toAddress,
			subject: emailData.subject,
			text: emailData.text || "",
			html: emailData.html || "",
		});

		if (res.error) {
			log(`Data processing failed: ${JSON.stringify(res.error)}`);
			const errorMessage =
				typeof res.error.value === "string"
					? res.error.value
					: `Data processing failed: ${JSON.stringify(res.error)}`;
			return callback(new Error(errorMessage));
		}

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
