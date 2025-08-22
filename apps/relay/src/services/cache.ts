import { Elysia } from "elysia";
import { DNSLookupService } from "../services/dns";

// Background service for cache management
export const cacheService = new Elysia({
	name: "cache-service",
})
	.onStart(() => {
		console.log("🧹 Starting cache cleanup service...");

		// Start cache cleanup interval - clean every minute
		const cleanupInterval = setInterval(() => {
			DNSLookupService.cleanCache();
		}, 60000);

		// Store interval for cleanup on shutdown
		globalThis.cacheCleanupInterval = cleanupInterval;
	})
	.onStop(() => {
		console.log("🛑 Stopping cache cleanup service...");

		if (globalThis.cacheCleanupInterval) {
			clearInterval(globalThis.cacheCleanupInterval);
			delete globalThis.cacheCleanupInterval;
		}
	});

// Global declaration for the cleanup interval
declare global {
	var cacheCleanupInterval: NodeJS.Timeout | undefined;
}
