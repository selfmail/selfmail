import { parse } from 'address-rfc2822';
import fetch from "node-fetch"
import type { Connection, Next } from "../../types/parameter.js";

exports.hook_data = function (this, next: Next, connection: any) {
	// enable mail body parsing
	connection.transaction.parse_body = true;
	next();
}

exports.hook_queue = async function (this, next: Next, connection: Connection) {
	const transaction = connection.transaction;
	const mail_from = transaction.mail_from.address();
	const rcpt_to = transaction.rcpt_to.map((rcpt) => rcpt.address());
	let email_body = "";
	const fromHeader = (connection.transaction.header.get('From') || "") as string
	const parsed = parse(fromHeader)[0];

	const name = parsed.name ? typeof parsed.name === "string"? parsed.name: parsed.name(): "";

	this.loginfo(`Name: ${name}`);

	const body = connection.transaction.body;

	if (body.bodytext) {
		email_body = body.bodytext;
	} else if (body.children && body.children.length > 0) {
		const textPart = body.children.find((child) => child.content_type === 'text/plain');
		if (textPart && textPart.bodytext) {
			email_body = textPart.bodytext;
		} else {
			email_body = body.children[0].bodytext || "";
		}
	} else {
		this.loginfo("Could not extract email body");
	}
	const subject = connection.transaction.header.get('subject')
	const rcpt = rcpt_to[0].split("@")[0]

	this.loginfo({
		from: mail_from,
		to: `${rcpt}@trash.company`,
		body: email_body,
		subject
	})


	const res = await fetch("http://localhost:4001/api/receive", {
		method: "POST",
		body: JSON.stringify({
			from: mail_from,
			to: `${rcpt}@trash.company`,
			body: email_body.toString(),
			subject
		})
	})

	if (!res.ok) {
		this.loginfo("Error at saving the email for " + rcpt_to)
		return next(DENY)
	}

	this.loginfo(
		`This mail came from: ${mail_from}\nIs for: ${rcpt_to}\nWith the content: ${email_body}`,
	);
	next(OK);
};

exports.plugin = {
	name: "save_email",
};