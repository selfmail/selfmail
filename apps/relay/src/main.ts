import { Elysia, status, t } from "elysia";
import { DNS } from "./services/dns";
import { Send } from "./services/send";

const app = new Elysia()
	.post(
		"/send",
		async ({ body: { from, subject, text, to, html } }) => {
			const server = to.split("@")[1];
			if (!server) return status(400, "Invalid email address");

			const records = await DNS.resolveMX(server);

			if (!records || records.length === 0) {
				return status(404, "No MX records found");
			}

			return await Send.mail({
				from,
				records,
				subject,
				to,
				html,
				text,
			});
		},
		{
			body: t.Object({
				to: t.String({
					format: "email",
				}),
				from: t.String({
					format: "email",
				}),
				subject: t.String(),
				html: t.Optional(t.String()),
				text: t.String(),
			}),
		},
	)
	.listen(4000);

console.log(`Listening on ${app.server?.url}`);
