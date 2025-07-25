import { cors } from "@elysiajs/cors";
import Elysia, { t } from "elysia";

const mockEmails = Array.from({ length: 200 }, (_, i) => ({
	id: `email-${i + 1}`,
	from: `user${i + 1}@example.com`,
	subject: `Subject ${i + 1}`,
	content: `This is the content of email ${i + 1}`,
	date: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
	unread: Math.random() > 0.5,
	avatar: `U${i + 1}`.charAt(0),
}));

export const web = new Elysia({ name: "Web", prefix: "/web" })
	.use(
		cors({
			origin: true,
		}),
	)
	.post("/register", async ({}) => {})
	.get(
		"/emails",
		async ({ query }) => {
			console.log("Emails endpoint hit with query:", query);

			const page = Number(query.page) || 1;
			const limit = Number(query.limit) || 20;
			const startIndex = (page - 1) * limit;
			const endIndex = startIndex + limit;

			const emails = mockEmails.slice(startIndex, endIndex);
			const totalCount = mockEmails.length;
			const totalPages = Math.ceil(totalCount / limit);

			const result = {
				data: emails,
				pagination: {
					page,
					limit,
					totalCount,
					totalPages,
					hasNextPage: page < totalPages,
					hasPreviousPage: page > 1,
				},
			};

			console.log("Returning result:", {
				emailCount: emails.length,
				totalCount,
			});
			return result;
		},
		{
			query: t.Object({
				page: t.Optional(t.Numeric({ default: 1, minimum: 1 })),
				limit: t.Optional(t.Numeric({ default: 20, minimum: 1, maximum: 100 })),
			}),
		},
	);
