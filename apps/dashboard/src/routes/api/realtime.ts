// src/routes/api/realtime.ts

import { subscribe } from "@selfmail/realtime";
import { createFileRoute } from "@tanstack/react-router";
import { Effect } from "effect";

export const Route = createFileRoute("/api/realtime")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
          start(controller) {
            const abortController = new AbortController();

            request.signal.addEventListener("abort", () => {
              abortController.abort();
              controller.close();
            });

            Effect.runFork(
              subscribe("mail.received", (payload) =>
                Effect.sync(() => {
                  controller.enqueue(
                    encoder.encode(
                      `event: mail.received\ndata: ${JSON.stringify(
                        payload
                      )}\n\n`
                    )
                  );
                })
              )
            );
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
