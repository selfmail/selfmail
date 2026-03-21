import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const registerSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
});

export const handleRegisterForm = createServerFn({ method: "POST" })
  .inputValidator(registerSchema)
  .handler((ctx) => {
    console.log("Handling register form with data:", ctx.data);

    console.log("Registration successful, redirecting...");

    return "Form submitted successfully";
  });
