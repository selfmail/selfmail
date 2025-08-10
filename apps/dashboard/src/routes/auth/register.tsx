import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "ui";
import { z } from "zod";
import { client } from "@/lib/client";

export const Route = createFileRoute("/auth/register")({
  component: RegisterComponent,
});

const schema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address."),
    name: z
      .string()
      .min(1, "Name is required")
      .max(50, "Name must be at most 50 characters long."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .max(128, "Password must be at most 128 characters long."),
    passwordVerification: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.passwordVerification, {
    message: "Passwords do not match.",
    path: ["passwordVerification"],
  });

function RegisterComponent() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      passwordVerification: "",
    },
    mode: "onSubmit",
  });

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    setIsLoading(true);
    form.clearErrors();

    try {
      const res = await client.v1.web.authentication.register.post({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      if (res.status !== 200 || (res as any)?.error) {
        const status = res.status;
        const message =
          (res as any)?.error?.message?.toString?.() ??
          "An error occurred during register. Your email may already be registered.";

        // Mappe serverseitige Fehler auf Felder bzw. global
        if (status === 409 || /already registered/i.test(message)) {
          form.setError("email", {
            type: "server",
            message: "Email already registered. Please log in instead.",
          });
        } else if (status === 429 || /too many requests/i.test(message)) {
          form.setError("root", {
            type: "server",
            message: "Too many requests. Please try again later.",
          });
        } else if (status === 400) {
          form.setError("root", {
            type: "server",
            message: message,
          });
        } else {
          form.setError("root", {
            type: "server",
            message:
              message ||
              "An unexpected error occurred. Please try again later.",
          });
        }
        return;
      }

      window.location.href = "/second-inbox";
    } catch (_err) {
      form.setError("root", {
        type: "server",
        message: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 px-5 md:px-0"
          >
            <h1 className={"font-bold text-2xl tracking-tight"}>Register</h1>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passwordVerification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="text-center text-red-600 text-sm">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className={"flex flex-row items-center space-x-2"}>
              <InfoIcon className={"h-4 w-4 text-muted-foreground"} />
              <p className={"text-muted-foreground text-sm"}>
                You are accepting our{" "}
                <Link to={"/legal/tos"} className={"text-blue-500"}>
                  Terms of Service
                </Link>
                .
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
