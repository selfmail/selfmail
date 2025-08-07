import Elysia from "elysia";
import { requireAuthentication } from "../authentication";
import { requirePermissions } from "../permissions";

export const workspace = new Elysia({
	prefix: "/workspace",
	detail: {
		description: "Endpoints for workspace settings",
	},
})
	.use(requireAuthentication)
	.use(requirePermissions)
	// edit the dashboard settings, all changed values from the settings form will be transmitted
	.post("/settings", async ({ body, user }) => {}, {
		isSignIn: true,
		permissions: ["workspace:edit"],
	})
	.post("/logo", async ({ body, user }) => {}, {
		isSignIn: true,
		permissions: ["workspace:edit"],
	});
