import { z } from "zod";

export async function SendMail(mail: {
	adresse: string;
	content: string;
	recipient: string;
	subject: string;
}): Promise<undefined | string> {
	"use server";

	const req = await fetch(
		process.env.NODE_ENV === "development"
			? "http://localhost:5000/v1/email/send"
			: `${process.env.BACKEND_URL}/v1/email/send`,
		{
			method: "POST",
			body: JSON.stringify({
				sender: mail.adresse,
				content: mail.content,
				recipient: mail.recipient,
				subject: mail.subject,
			}),
			headers: {
				Authorization: `Bearer ${process.env.API_KEY}`,
			},
		},
	);
	if (!req) return "Internal server error. Try again.";

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
