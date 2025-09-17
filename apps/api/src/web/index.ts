import { cors } from "@elysiajs/cors";
import Elysia from "elysia";
import { activity } from "./activity";
import { address } from "./address";
import { authentication } from "./authentication";
import { dashboard } from "./dashboard";
import { members } from "./members";
import { payments } from "./payments";
import { smtpCredentials } from "./smtp";
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
	.use(activity)
	.use(authentication)
	.use(payments)
	.use(members)
	.use(address)
	.use(smtpCredentials);
