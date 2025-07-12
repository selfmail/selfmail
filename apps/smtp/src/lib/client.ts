import { treaty } from "@elysiajs/eden";
import type { Smtp } from "@/../smtp-api/src/index.ts";

export const client = treaty<Smtp>("localhost:4001");
