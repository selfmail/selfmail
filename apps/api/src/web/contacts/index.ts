import Elysia from "elysia";

export const contacts = new Elysia({
	name: "service/contacts",
	prefix: "/contacts",
}).post("/create", async (ctx) => {
	const { body } = ctx;
	// Handle contact creation logic here
	return { success: true, message: "Contact created successfully", data: body };
});
