import { Ratelimit } from "@unkey/ratelimit";

export const unkey = new Ratelimit({
	rootKey: process.env.UNKEY_RATELIMITING ?? "",
	namespace: "dashboard",
	limit: 10,
	duration: "30s",
});
