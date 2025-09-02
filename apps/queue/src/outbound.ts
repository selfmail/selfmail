import type { Job } from "bullmq";
import type { ParsedMail } from "mailparser";
import { Logs } from "services/logs";
import { Spam } from "services/spam";
import z from "zod";
import { type OutboundEmail, outboundSchema } from "./schema/outbound";
import { DNS } from "./services/dns";
import { Send } from "./services/send";

export async function outbound(job: Job<OutboundEmail, void, string>) {
	Logs.log("Received outbound email to send.");
	const parse = await outboundSchema.safeParseAsync(
		JSON.parse(job.data.toString()),
	);

	if (!parse.success) {
		console.error(z.prettifyError(parse.error));
		Logs.error("Parsing outbound email went wrong!");

		return;
	}

	const mail = parse.data;

	let recipientEmail: string;
	if (mail.to) {
		if (Array.isArray(mail.to)) {
			recipientEmail = mail.to[0]?.value[0]?.address || "";
		} else {
			recipientEmail = mail.to.value[0]?.address || "";
		}
	} else {
		Logs.error("No recipient address found in email!");

		return;
	}

	const host = recipientEmail.split("@")[1];

	if (!host) {
		Logs.error("Extracting host from email address went wrong!");

		return;
	}

	const spamResult = await Spam.check(mail as unknown as ParsedMail);
	if (spamResult.allow === false) {
		Logs.error("Outbound email blocked due to spam!");

		return;
	}

	const mxRecords = await DNS.resolveMX(host);

	if (!mxRecords || mxRecords.length === 0) {
		Logs.error(`No MX records found for host ${host}`);

		return;
	}

	const messageId = await Send.mail({
		...mail,
		records: mxRecords,
	});

	await job.moveToFailed(new Error("Failed to send email."), "sdfsdf");

	if (messageId) {
		Logs.log(`Sent outbound email: ${mail.subject} (Message ID: ${messageId})`);
	}
}
