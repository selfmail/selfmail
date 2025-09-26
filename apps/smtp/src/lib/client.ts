import { treaty } from "@elysiajs/eden";
import type { Smtp } from "@/../smtp-api/src/index.ts";

export const client = treaty<Smtp>(
	process.env.SMTP_API_URL || "http://localhost:4001",
);
