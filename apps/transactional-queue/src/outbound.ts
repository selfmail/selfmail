import { type Job, UnrecoverableError } from "bullmq";
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
		throw new UnrecoverableError(
			`Invalid job data. It was not possible to parse the job with job-id: ${job.id}`,
		);
	}

	const mail = parse.data;

	const host = mail.to?.split("@")[1] ?? "";

	if (!host) {
		throw new UnrecoverableError(
			"Extracting host from email address went wrong!",
		);
	}

	const mxRecords = await DNS.resolveMX(host);

	if (!mxRecords || mxRecords.length === 0) {
		throw new Error(`No MX records found for host ${host}`);
	}

	const messageId = await Send.mail({
		...mail,
		records: mxRecords,
	}).catch(async (err) => {
		throw new Error(
			`Sending email failed for mail with mail-id: ${job.id}\n${err}`,
		);
	});

	if (!messageId) {
		throw new Error("Failed to send email - no message ID returned");
	}
}
