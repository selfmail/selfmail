import { drizzle } from "drizzle-orm/node-postgres";
import * as addressSchema from "./schema/addresses";
import * as permissionsSchema from "./schema/permissions";
import * as userSchema from "./schema/user";
import * as workspaceSchema from "./schema/workspace";

export const db = drizzle(process.env.DATABASE_URL || "", {
	schema: {
		...addressSchema,
		...permissionsSchema,
		...userSchema,
		...workspaceSchema,
	},
});
