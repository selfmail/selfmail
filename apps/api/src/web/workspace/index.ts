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
	.post("/create", async ({ body, user }) => {}, {
		detail: {
			description: "Create a new workspace",
		},
	})
	.use(requirePermissions)
	.post("/invite", async ({ body, user }) => {}, {
		permissions: ["workspace:invite"],
	})
	// edit the dashboard settings, all changed values from the settings form will be transmitted
	.post("/settings", async ({ body, user }) => {}, {
		permissions: ["workspace:edit"],
	})
	.post("/logo", async ({ body, user }) => {}, {
		permissions: ["workspace:edit"],
	})
	.post("/delete", async ({ body, user }) => {}, {
		permissions: ["workspace:delete"],
	})
	.post("/leave", async ({ body, user }) => {}, {
		permissions: ["workspace:leave"],
	})
	.post("/kick", async ({ body, user }) => {}, {
		permissions: ["workspace:kick"],
	});
