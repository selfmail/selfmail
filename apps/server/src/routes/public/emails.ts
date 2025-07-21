import { app } from "../../app.js";

// Mock email data - in production this would come from your database
const mockEmails = Array.from({ length: 500 }, (_, i) => ({
	id: `email-${i + 1}`,
	from: `sender${i + 1}@example.com`,
	subject: `Email Subject ${i + 1} - This is a test email with some content`,
	content: `This is the content of email ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
	date: new Date(
		Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
	).toISOString(),
	unread: Math.random() > 0.7,
	avatar: `U${i + 1}`,
}));

export default async function () {
	app.get("/v1/emails", async (c) => {
		const cursor = c.req.query("cursor");
		const limitParam = c.req.query("limit");
		const limit = Math.min(Number.parseInt(limitParam || "20"), 50);

		// Parse cursor to get the starting index
		const startIndex = cursor ? Number.parseInt(cursor) : 0;
		const endIndex = Math.min(startIndex + limit, mockEmails.length);

		// Get the requested slice of emails
		const emails = mockEmails.slice(startIndex, endIndex);

		// Calculate next cursor
		const nextCursor =
			endIndex < mockEmails.length ? endIndex.toString() : null;

		return c.json({
			emails,
			nextCursor,
			hasMore: nextCursor !== null,
			total: mockEmails.length,
		});
	});
}
