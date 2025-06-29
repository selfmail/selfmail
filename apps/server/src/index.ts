import "dotenv/config";
import { app } from "./app";
import { env } from "./lib/env";

export { app };
export default app;

// For local development
export const config = {
	port: env.PORT,
	hostname: env.HOST,
	fetch: app.fetch,
};

console.log(
	`🚀 Server starting on ${env.HOST}:${env.PORT} in ${env.NODE_ENV} mode`,
);
