import { Elysia, status, t } from "elysia";

const app = new Elysia()
	.post(
		"/send",
		async ({ body: { from, subject, text, to, html } }) => {
			// TODO: integrate queue
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
