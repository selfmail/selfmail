import { createServerFn } from "@tanstack/react-start";

export const handleLoginForm = createServerFn({
  method: "POST",
})
  .inputValidator((data: { email: string }) => {
    if (!data.email) {
      throw new Error("Email is required");
    }
    return data;
  })
  .handler((ctx) => {
    console.log("Handling login form with data:", ctx.data);

    console.log("Login successful, redirecting...");

    return "Form submitted successfully";
  });
