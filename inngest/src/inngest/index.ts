import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" });

const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);
await inngest.send({
  name: "test/hello.world",
  data: {
    email: "hey@example.com",
  },
});
// Add the function to the exported array:
export const functions = [helloWorld];
