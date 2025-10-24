import path from "node:path";
import { config } from "dotenv";
import type { PrismaConfig } from "prisma";

// Load environment variables from .env file
config({ path: path.join(__dirname, ".env") });

export default {
	schema: path.join("prisma"),
} satisfies PrismaConfig;
