import Elysia from "elysia";
import { requirePermissions } from "../permissions";

export const workspace = new Elysia({
	prefix: "/workspace",
	detail: {
		description: "Endpoints for workspace settings",
	},
})
	.use(requirePermissions)
	// edit the dashboard settings, all changed values from the settings form will be transmitted
	.post("/settings", async ({ body, user }) => {}, {
		permissions: ["workspace:edit"],
	})
	.post("/logo", async ({ body, user }) => {}, {
		permissions: ["workspace:edit"],
	});
