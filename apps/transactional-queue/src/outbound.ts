import { type Job, UnrecoverableError } from "bullmq";
import type { ParsedMail } from "mailparser";
import { Logs } from "services/logs";
import { Notify } from "services/notify";
import { Spam } from "services/spam";
import z from "zod";
import { type OutboundEmail, outboundSchema } from "./schema/outbound";
import { DNS } from "./services/dns";
import { Send } from "./services/send";

export async function outbound(job: Job<OutboundEmail & { sendByUser?: boolean, memberId?: string }, void, string>) {
	const parse = await outboundSchema.safeParseAsync(job.data);

	if (!parse.success) {
		await Logs.error("Parsing outbound email failed!", {
			jobId: job.id,
			errors: z.prettifyError(parse.error),
			rawData: job.data,
		});

		if (job.data.sendByUser && job.data.memberId) {
			await Notify.notifyUser({
				title: "Failed to send email",
				description: `We had an error while trying to send your email ${job.data.subject ? `with subject "${job.data.subject}" ` : ""} ${Array.isArray(job.data.to) && job.data.to.length > 0 && "to"} ${Array.isArray(job.data.to) ? job.data.to.map(t => t.value.map(v => v.address).join(", ")).join(", ") : ""}. Please try again later or contact support if the issue persists.`,
				type: "error",
				memberId: job.data.memberId,
			});
		}

		throw new UnrecoverableError(
			`Invalid job data. It was not possible to parse the job with job-id: ${job.id}`,
		);
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
		await Logs.error("No recipient email address found in the job data!", {
			jobId: job.id,
			data: mail,
		});
		throw new UnrecoverableError(
			"No recipient email address found in the job data",
		);
	}

	const host = recipientEmail.split("@")[1];

	if (!host) {
		await Logs.error("Extracting host from email address went wrong!", {
			jobId: job.id,
			address: mail.to,
			recipient: recipientEmail,
		});

		throw new UnrecoverableError(
			"Extracting host from email address went wrong!",
		);
	}

	const spamResult = await Spam.check(mail as unknown as ParsedMail).catch(async (err) => {
		await Logs.error("Spam check failed!", {
			jobId: job.id,
			error: err,
			data: mail,
		});

		throw new Error(`Spam check failed for mail with mail-id: ${job.id}`);
	});

	if (spamResult.allow === false) {
		await Logs.error("Outbound email blocked due to spam!", {
			jobId: job.id,
			data: mail,
		});

		throw new UnrecoverableError("Outbound email blocked due to spam");
	}

	const mxRecords = await DNS.resolveMX(host);

	if (!mxRecords || mxRecords.length === 0) {
		await Logs.error(`No MX records found for host ${host}`, {
			jobId: job.id,
			host,
		});

		throw new Error(`No MX records found for host ${host}`);
	}

	const messageId = await Send.mail({
		...mail,
		records: mxRecords,
	}).catch(async (err) => {
		await Logs.error("Sending email failed!", {
			jobId: job.id,
			error: err,
			data: mail,
			mxRecords,
		});

		throw new Error(`Sending email failed for mail with mail-id: ${job.id}`);
	});

	if (messageId) {
		Logs.log(`Sent outbound email: ${mail.subject} (Message ID: ${messageId})`);
	} else {
		await Logs.error("Failed to send email - no message ID returned", {
			jobId: job.id,
			data: mail,
			mxRecords,
		});

		throw new Error("Failed to send email - no message ID returned");
	}
}
