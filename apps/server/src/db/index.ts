import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

export const db = drizzle(process.env.DATABASE_URL || "", { schema });

export * from "./schema.js";
