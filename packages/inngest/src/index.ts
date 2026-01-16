import Bun from "bun";
import { serve } from "inngest/bun";
import { functions, inngest } from "./inngest";

Bun.serve({
  port: 9090,
  routes: {
    "/api/inngest": serve({ client: inngest, functions }),
  },
});

console.log("Inngest listening on http://localhost:9090/api/inngest");
