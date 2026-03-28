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
  .handler((_ctx) => {
    return "Form submitted successfully";
  });
