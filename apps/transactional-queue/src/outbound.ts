import { type Job, UnrecoverableError } from "bullmq";
import consola from "consola";
import z from "zod";
import { type OutboundEmail, outboundSchema } from "./schema/outbound";
import { DNS } from "./services/dns";
import { Send } from "./services/send";

export async function transactionalOutbound(
	job: Job<
		OutboundEmail & { sendByUser?: boolean; memberId?: string },
		void,
		string
	>,
) {
	const parse = await outboundSchema.safeParseAsync(job.data);

	if (!parse.success) {
		consola.error(
			"Failed to parse job data. Problem:",
			z.prettifyError(parse.error),
		);
		throw new UnrecoverableError(
			`Invalid job data. It was not possible to parse the job with job-id: ${job.id}`,
		);
	}

	const mail = parse.data;

	const host = mail.to?.split("@")[1] ?? "";

	if (!host) {
		consola.error("Failed to extract host from email address.");
		throw new UnrecoverableError(
			"Extracting host from email address went wrong!",
		);
	}

	const mxRecords = await DNS.resolveMX(host);

	if (!mxRecords || mxRecords.length === 0) {
		consola.error(`No MX records found for host ${host}`);
		throw new Error(`No MX records found for host ${host}`);
	}

	const messageId = await Send.mail({
		...mail,
		records: mxRecords,
	}).catch(async (err) => {
		consola.error(
			`Sending email failed for mail with mail-id: ${job.id}\n${err}`,
		);
		throw new Error(
			`Sending email failed for mail with mail-id: ${job.id}\n${err}`,
		);
	});

	if (!messageId) {
		throw new Error("Failed to send email - no message ID returned");
	}
}
