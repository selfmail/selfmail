import { treaty } from "@elysiajs/eden";
import type { App } from "../../../api/src/index";

// Create a client with session-based authentication
function createAuthenticatedClient() {
	// For session-based auth, we don't need to set headers manually
	// The browser will automatically include cookies in same-origin requests
	return treaty<App>("http://localhost:3000", {
		fetch: {
			credentials: "include", // Include cookies in requests
		},
	});
}

export const client = createAuthenticatedClient();

// Function to recreate client (keeping for compatibility)
export function updateClientAuth() {
	const newClient = createAuthenticatedClient();
	Object.assign(client, newClient);
}
