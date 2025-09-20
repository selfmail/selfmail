import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { neon } from "@neondatabase/serverless";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
	redis: new Redis({
		url: import.meta.env.UPSTASH_REDIS_REST_URL,
		token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
	}),
	limiter: Ratelimit.slidingWindow(10, "10 s"),
});

const sql = neon(import.meta.env.DATABASE_URL);

export const server = {
	signWaitlist: defineAction({
		accept: "form",
		input: z.object({
			email: z.string().email(),
		}),
		handler: async (input) => {
			const identifier = "waitlist-api:" + input.email;
			const { success } = await ratelimit.limit(identifier);

			if (!success) {
				console.log(success);
				return "Unable to process at this time";
			}

			await sql`INSERT INTO "Waitlist" (email) VALUES (${input.email}) ON CONFLICT (email) DO NOTHING;`;

			console.log("Received waitlist sign-up:", input.email);
		},
	}),
};
