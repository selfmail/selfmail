import { Inngest } from "inngest";

export const inngest = new Inngest({
	id: process.env.INNGEST_ID || "selfmail-dev",
});
