import { Elysia, t } from "elysia";
import { Queue } from "services/queue";

const app = new Elysia()
	.post(
		"/send",
		async ({ body: { from, subject, text, to, html } }) => {
			console.log("Received relay connection");
			try {
				await Queue.processOutbound({
					from,
					subject,
					body: text,
					html,
					to,

					delay: 0,
				});
				return {
					success: true,
				};
			} catch (error) {
				console.error("Error processing outbound email:", error);
				return {
					success: false,
				};
			}
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
