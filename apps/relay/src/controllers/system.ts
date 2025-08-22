import { Elysia } from "elysia";
import { RelayModule } from "../modules";
import { EmailRelayService } from "../services/relay";

export const systemController = new Elysia({
	name: "system-controller",
	detail: {
		tags: ["System"],
		description: "System health and monitoring endpoints",
	},
})
	.model({
		"system.health": RelayModule.HealthResponse,
		"system.stats": RelayModule.StatsResponse,
	})
	.get(
		"/health",
		() => ({
			status: "ok",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
		}),
		{
			response: {
				200: "system.health",
			},
			detail: {
				summary: "Health check endpoint",
				description: "Returns the health status of the relay server",
				tags: ["System"],
			},
		},
	)
	.get(
		"/stats",
		() => {
			const stats = EmailRelayService.getStats();
			return {
				cacheSize: stats.cacheStats.size,
				uptime: stats.uptime,
				memory: stats.memory,
				timestamp: new Date().toISOString(),
			};
		},
		{
			response: {
				200: "system.stats",
			},
			detail: {
				summary: "System statistics",
				description:
					"Returns system statistics including cache size, uptime, and memory usage",
				tags: ["System"],
			},
		},
	);
