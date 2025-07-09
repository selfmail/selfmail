import { cors } from "@elysiajs/cors";
import Elysia, { t } from "elysia";

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
	.get("/", () => "<h1>Hello World</h1>", {
		afterHandle({ response, set }) {
			set.headers["Content-Type"] = "text/html; charset=utf8";
		},
	})
	.get("/hi", () => "<h1>Hello World</h1>");
