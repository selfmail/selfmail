import { SendMessage } from "postal-js";
import { z } from "zod";

export async function SendMail(mail: {
	adresse: string;
	content: string;
	recipient: string;
	subject: string;
}): Promise<undefined | string> {
	"use server";

	const req = await fetch("http://localhost:5000/v1/email/send",
		{
			method: "POST",
			body: JSON.stringify({
				from: mail.adresse,
				to: [mail.recipient],
				subject: mail.subject,
				html_body: mail.content,
			} satisfies SendMessage),
		},
	);
	console.log(req.statusText)
	if (!req || !req.ok) return "Internal server error.";

	const data = await req.json()

	const parse = await z
		.object({
			error: z.string().optional(),
			message: z.string().optional(),
		})
		.safeParseAsync({
			...data,
		});

	if (data.error) return data.error;

	if (!parse.success) return "Internal server error.";
}
