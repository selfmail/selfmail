import { cors } from "@elysiajs/cors";
import Elysia, { status, t } from "elysia";
import z from "zod";
import { unkey } from "../lib/unkey";

export const web = new Elysia({ name: "Web", prefix: "/web" })
	.use(
		cors({
			origin: (context) => {
				if (process.env.NODE_ENV === "development") return true;
				if (context.url) {
					const url = new URL(context.url);
					const corsOrigins = process.env.CORS?.split(",") || [];
					if (corsOrigins.includes(url.origin)) {
						return true;
					}
				}
			},
			methods: ["GET", "POST", "PUT", "DELETE"],
		}),
	)
	.onRequest(async ({ server, request, status }) => {
		console.log(server?.requestIP(request));
		let ip: string | undefined;
		const ipv4 = await z
			.ipv4()
			.safeParseAsync(server?.requestIP(request)?.address || "");
		const ipv6 = await z
			.ipv6()
			.safeParseAsync(server?.requestIP(request)?.address || "");

		if (!ipv4.success && !ipv6.success) {
			throw status(400, "Invalid IP address format");
		}

		if (ipv4.success) {
			ip = ipv4.data;
		} else if (ipv6.success) {
			ip = ipv6.data;
		}
		if (!ip) {
			throw status(400, "IP address not found");
		}

		const ratelimit = await unkey.limit(ip);

		if (!ratelimit.success) {
			return new Response("try again later", { status: 429 });
		}
	})
	.get("/", () => "<h1>Hello World</h1>", {
		afterHandle({ response, set }) {
			set.headers["Content-Type"] = "text/html; charset=utf8";
		},
	})
	.get("/hi", () => "<h1>Hello World</h1>");
