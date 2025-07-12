import { Ratelimit } from "@unkey/ratelimit";

export const inboundRatelimiting = new Ratelimit({
	rootKey: process.env.UNKEY_ROOT_KEY ?? "",
	namespace: "inbound-connections",
	limit: 10,
	duration: "30s",
});
