import { drizzle } from "drizzle-orm/node-postgres";
import * as addressSchema from "./schema/addresses.js";
import * as permissionsSchema from "./schema/permissions.js";
import * as userSchema from "./schema/user.js";
import * as workspaceSchema from "./schema/workspace.js";

export const db = drizzle(process.env.DATABASE_URL || "", {
	schema: {
		...addressSchema,
		...permissionsSchema,
		...userSchema,
		...workspaceSchema,
	},
});
