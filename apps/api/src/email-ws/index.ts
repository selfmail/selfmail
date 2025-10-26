import Elysia from "elysia";

export const emailWebsocket = new Elysia({
	prefix: "/ws/email",
	detail: {
		description:
			"WebSocket endpoint for email events, so forward them into the frontend.",
	},
}).ws("/", {
	open(ws) {
		console.log("WebSocket opened:", ws.id);
	},
	close(ws) {
		console.log("WebSocket closed:", ws.id);
	},
	message(ws, message) {
		console.log("WebSocket message:", ws.id, message);
	},
});
