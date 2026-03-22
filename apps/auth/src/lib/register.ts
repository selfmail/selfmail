import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
});

export const handleRegisterForm = createServerFn({ method: "POST" })
  .inputValidator(registerSchema)
  .handler(async (ctx) => {
    console.log("Handling register form with data:", ctx.data);
    const { email, password, name } = ctx.data;

    try {
      const existingUser = await db.user.findFirst({ where: { email } });

      if (existingUser) {
        throw new Error("Email is already registered");
      }
    } catch (e) {
      console.error("Error checking existing user:", e);
    }

    // Creating new user
    try {
      await db.account.create({
        data: {
          provider: "EMAIL",
          providerAccountId: email,
        },
      });
      await db.user.create({
        data: {
          email,
          name,
        },
      });
    } catch (e) {
      console.error("Error creating user:", e);
      throw new Error("Failed to create user");
    }

    console.log("Registration successful, redirecting...");

    return "Form submitted successfully";
  });
