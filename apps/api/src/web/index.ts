import { cors } from "@elysiajs/cors";
import Elysia from "elysia";
import { authentication } from "./authentication";
import { dashboard } from "./dashboard";
import { payments } from "./payments";
import { workspace } from "./workspace";

export const web = new Elysia({ name: "Web", prefix: "/web" })
	.use(
		cors({
			origin: true,
		}),
	)
	.get("/health", () => "OK", {
		detail: {
			description: "Health check endpoint.",
		},
	})
	.use(dashboard)
	.use(workspace)
	.use(authentication)
	.use(payments);
