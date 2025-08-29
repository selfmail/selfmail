import type { MxRecord } from "node:dns";
import { status } from "elysia";
import nodemailer from "nodemailer";
import { Logs } from "services/logs";

export abstract class Send {
	static async mail({
		from,
		records,
		subject,
		to,
		html,
		text,
	}: {
		to: string;
		from: string;
		subject: string;
		html?: string;
		text?: string;

		records: MxRecord[];
	}) {
		const host = records[0]?.exchange;

		Logs.log(
			`${{
				to,
				from,
				subject,
				html,
				text,
			}}`,
		);

		if (!host) return status(500, "Internal Server Error");
		const transporter = nodemailer.createTransport({
			host,
			port: 25,
		});

		const verify = await transporter.verify();

		if (!verify) return status(500, "Could not verify SMTP host.");

		const send = await transporter.sendMail({
			to,
			from,
			subject,
			html,
			text,
		});

		if (!send.messageId) return status(500, "Email error.");

		Logs.log(
			`${{
				to,
				from,
				subject,
				html,
				text,
			}}`,
		);

		return status(200, "Email sent successfully.");
	}
}
