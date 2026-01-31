import Bun from "bun";

Bun.serve({
  port: 6666,
  routes: {
    "/": (_) => {
      return new Response("Welcome to the Spamlist service!");
    },
    "/spamlist": {
      GET: (_) => {
        return new Response("Hello, Spamlist!");
      },
      POST: async (request) => {
        const data = await request.json();
        return new Response(`Received data: ${JSON.stringify(data)}`);
      },
    },
  },
});

console.log("Spamlist service is running on http://localhost:6666/spamlist");
