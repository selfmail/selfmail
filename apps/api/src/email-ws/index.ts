import { Worker } from "bullmq";
import Elysia, { t } from "elysia";
import IORedis from "ioredis";
import {
	middlewareAuthentication,
	verifyWorkspaceMembership,
} from "../lib/auth";

export const connection = new IORedis(
	process.env.REDIS_URL ?? "redis://localhost:6379",
	{
		maxRetriesPerRequest: null,
	},
);

export const emailWebsocket = new Elysia({
	prefix: "/ws/email",
	detail: {
		description:
			"WebSocket endpoint for email events, so forward them into the frontend.",
	},
}).ws("/", {
	cookie: t.Cookie({
		"selfmail-session-token": t.String({
			description: "Session token for authentication",
		}),
	}),
	query: t.Object({
		workspaceSlug: t.String({
			description: "The slug of the workspace to connect to",
		}),
	}),
	async open(ws) {
		// Validating current session with token from cookie
		const sessionToken = ws.data.cookie["selfmail-session-token"].value;

		if (!sessionToken || sessionToken.length === 0) {
			ws.close(1008, "Invalid session token");
			return;
		}

		// Check the session token against your authentication system here
		const { authenticated, user } =
			await middlewareAuthentication(sessionToken);

		if (!authenticated || !user) {
			ws.close(1008, "Authentication failed");
			return;
		}

		const { isMember, member, workspace } = await verifyWorkspaceMembership(
			user.id,
			ws.data.query.workspaceSlug,
		);

		if (!isMember || !member || !workspace) {
			ws.close(1008, "Workspace membership verification failed");
			return;
		}

		ws.send(`Connected to workspace: ${workspace.name}`);
	},
	close(ws) {
		console.log("WebSocket closed:", ws.id);
	},
	message(ws, message) {
		const worker = new Worker<{}, void>(
			"foo",
			async (job) => {
				ws.send(job.data);
			},
			{
				connection,
				concurrency: 5,
			},
		);
	},
});
