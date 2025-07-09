import { treaty } from "@elysiajs/eden";
import type { App } from "@/../api/src/index";

export const client = treaty<App>("localhost:3000");
