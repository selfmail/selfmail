import { simpleParser } from "mailparser";
import { Logs } from "services/logs";
import type { SMTPServerDataStream, SMTPServerSession } from "smtp-server";
import { client } from "@/lib/client";
import { Parse } from "@/utils/parse";

const extractAddress = (address: string | { address: string }) => {
	if (typeof address === "string") {
		return address;
	}
	return address.address;
};

const extractSender = (
	to:
		| string
		| {
				address: string;
				name?: string | undefined;
		  }
		| {
				address: string;
				name?: string | undefined;
		  }[]
		| string[],
) =>
	Array.isArray(to)
		? to[0] && (typeof to[0] === "string" ? to[0] : to[0].address)
		: typeof to === "string"
			? to
			: to.address;

async function createProperAttachments(
	attachments: {
		filename?: string | undefined;
		contentType?: string | undefined;
		size?: number | undefined;
		content?: string | undefined;
		cid?: string | undefined;
		securityThreats?: string[] | undefined;
		isSecure?: boolean | undefined;
	}[],
) {
	// Create proper File objects for the attachments
	return attachments.map((att) => {
		if (!att.content) {
			return new File([], att.filename || "unknown", {
				type: att.contentType || "application/octet-stream",
			});
		}

		const buffer = Buffer.from(att.content, "base64");
		return new File([buffer], att.filename || "unknown", {
			type: att.contentType || "application/octet-stream",
		});
	});
}

const extractErrorMessage = (error: {
	status: 422;
	value: {
		type: "validation";
		on: string;
		summary?: string | undefined;
		message?: string | undefined;
		found?: unknown;
		property?: string | undefined;
		expected?: string | undefined;
	};
}) => {
	return typeof error.value === "string"
		? error.value
		: `Data processing failed: ${JSON.stringify(error)}`;
};

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

		Logs.log("Email parsed successfully");

		const emailData = await Parse.inboundEmail(
			parsed,
			session.id,
			session.remoteAddress || undefined,
		);

		// Extract email addresses for spam checking
		const fromAddress = extractAddress(emailData.from);
		const toAddress = extractSender(emailData.to);

		if (!toAddress || !fromAddress) {
			return callback(new Error("No valid recipient address found"));
		}

		const data = {
			attachments: await createProperAttachments(emailData.attachments || []),
			mailFrom: fromAddress,
			to: toAddress,
			subject: emailData.subject,
			text: emailData.text || "",
			html: emailData.html || "",
		};

		const res = await client.inbound.data.post(data);

		if (res.error) {
			const errorMessage = extractErrorMessage(res.error);
			Logs.error(
				`Error processing email data with error message: ${errorMessage}`,
			);
			return callback(new Error(errorMessage));
		}

		Logs.log(
			`Email from ${fromAddress} to ${toAddress} processed successfully`,
		);

		callback();
	} catch (error) {
		callback(error instanceof Error ? error : new Error(String(error)));
	}
}

// const spam = await client.inbound.spam.post({
// 	body: emailData.text || "",
// 	subject: emailData.subject,
// 	html: emailData.html || "",
// 	from: fromAddress,
// 	to: toAddress,
// 	attachments:
// 		emailData.attachments?.map((att) => {
// 			// Create a proper File object from the attachment for spam checking
// 			if (!att.content) {
// 				return new File([], att.filename || "unknown", {
// 					type: att.contentType || "application/octet-stream",
// 				});
// 			}

// 			const buffer = Buffer.from(att.content, "base64");
// 			const file = new File([buffer], att.filename || "unknown", {
// 				type: att.contentType || "application/octet-stream",
// 			});
// 			return file;
// 		}) || [],
// });

// if (spam.error) {
// 	const errorMessage =
// 		typeof spam.error.value === "string"
// 			? spam.error.value
// 			: `Spam check failed: ${JSON.stringify(spam.error)}`;
// 	return callback(new Error(errorMessage));
// }

// if (spam.data) {
// 	// If email is marked as spam/rejected, reject it
// 	if (spam.data.action === "reject" || spam.data.score > 5) {
// 		const err = Object.assign(new Error("Email rejected by spam filter"), {
// 			responseCode: 550,
// 		});
// 		return callback(err);
// 	}
// }
