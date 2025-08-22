import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { dnsController } from "./controllers/dns";
import { emailController } from "./controllers/email";
import { relayController } from "./controllers/relay";
import { systemController } from "./controllers/system";
import { RelayModule } from "./modules";
import { cacheService } from "./services/cache";
import { EmailSenderService } from "./services/sender";

// Create the main relay server with high-performance configuration
const app = new Elysia({
	name: "selfmail-relay",
	detail: {
		description: "High-performance email relay server for Selfmail",
	},
	// Optimize for speed
	strictPath: false,
})
	// Global models that can be referenced across controllers
	.model({
		"relay.target": RelayModule.RelayTargetResponse,
	})

	// Enable CORS for cross-origin requests
	.use(
		cors({
			origin: true,
			credentials: true,
		}),
	)

	// Add OpenAPI documentation with Swagger
	.use(
		swagger({
			documentation: {
				info: {
					title: "Selfmail Relay API",
					description:
						"High-performance email relay server with DNS resolution and caching",
					version: "1.0.0",
					contact: {
						name: "Selfmail Team",
					},
				},
				tags: [
					{
						name: "Email Relay",
						description: "Email relay processing endpoints",
					},
					{ name: "DNS Lookup", description: "DNS resolution utilities" },
					{
						name: "Email Sending",
						description: "Direct email sending via SMTP",
					},
					{ name: "System", description: "System health and monitoring" },
				],
			},
			path: "/docs",
		}),
	)

	// Initialize background services
	.use(cacheService)

	// Mount controllers
	.use(relayController)
	.use(dnsController)
	.use(systemController)
	.use(emailController)

	// Global error handling
	.onError(({ error, code, path }) => {
		console.error(`❌ Error ${code} at ${path}:`, error);

		if (code === "NOT_FOUND") {
			return {
				success: false,
				error: "Endpoint not found",
				timestamp: new Date().toISOString(),
			};
		}

		if (code === "VALIDATION") {
			return {
				success: false,
				error: "Invalid request data",
				details: error.message,
				timestamp: new Date().toISOString(),
			};
		}

		return {
			success: false,
			error: "Internal server error",
			timestamp: new Date().toISOString(),
		};
	})

	// Start the server
	.listen({
		port: process.env.PORT ? Number.parseInt(process.env.PORT) : 8080,
		hostname: process.env.HOST || "0.0.0.0",
	});

console.log(
	`Relay Server running at http://${app.server?.hostname}:${app.server?.port}`,
);

// Graceful shutdown handling
process.on("SIGINT", async () => {
	console.log("\n🛑 Shutting down gracefully...");
	await EmailSenderService.closeConnections();
	console.log("✅ All email connections closed");
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("\n🛑 Shutting down gracefully...");
	await EmailSenderService.closeConnections();
	console.log("✅ All email connections closed");
	process.exit(0);
});

export type RelayApp = typeof app;
