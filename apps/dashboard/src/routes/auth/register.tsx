import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  AlertDescription,
  AlertTitle,
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
import { formatErrorText, getFirstFormError } from "@/lib/form/validation";

export const Route = createFileRoute("/auth/register")({
  component: RegisterComponent,
  validateSearch: z
    .object({
      redirectTo: z.string().optional(),
      error: z.string().optional(),
    })
    .optional()
    .default({}),
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
  const search = Route.useSearch();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      passwordVerification: "",
    },
    mode: "onChange",
    criteriaMode: "all",
    delayError: 700,
  });

  useEffect(() => {
    // Check if search and search.error exist before using them
    if (search && typeof search.error === "string" && search.error) {
      form.setError("root", {
        type: "server",
        message: search.error,
      });
    }
  }, [search, form]);

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    if (!form.formState.isValid) {
      return; // Don't submit if form is invalid
    }

    setIsLoading(true);
    form.clearErrors();

    try {
      console.log("Submitting registration form:", values);
      const res = await client.v1.web.authentication.register.post({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      if (res.status !== 200) {
        const status = res.status;
        // Access error message safely from response data
        const message =
          typeof res.data === "object" && res.data
            ? res.data.message ||
            "An error occurred during registration. Your email may already be registered."
            : "An error occurred during registration. Your email may already be registered.";

        // Map server-side errors to fields or global errors
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
          // Try to extract field-specific errors if available
          if (/email/i.test(message)) {
            form.setError("email", {
              type: "server",
              message: message,
            });
          } else if (/password/i.test(message)) {
            form.setError("password", {
              type: "server",
              message: message,
            });
          } else if (/name/i.test(message)) {
            form.setError("name", {
              type: "server",
              message: message,
            });
          } else {
            form.setError("root", {
              type: "server",
              message: message,
            });
          }
        } else {
          form.setError("root", {
            type: "server",
            message:
              message ||
              "An unexpected error occurred. Please try again later.",
          });
        }
        setIsLoading(false);
        return;
      }

      // Show success message before redirecting
      setSuccess(true);
      setTimeout(() => {
        window.location.href = (search && search.redirectTo) || "/second-inbox";
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      form.setError("root", {
        type: "server",
        message:
          err instanceof Error
            ? err.message
            : "Network error. Please check your connection and try again.",
      });
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-4 px-5 md:px-0">
          <Alert className="border-green-200 bg-green-50">
            <AlertTitle>Registration Successful</AlertTitle>
            <AlertDescription>
              Your account has been created successfully. You will be redirected
              to your inbox shortly.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

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
                {formatErrorText(
                  form.formState.errors.root.message?.toString() ||
                  "An error occurred during registration",
                )}
              </div>
            )}

            {form.formState.isSubmitted &&
              !form.formState.isValid &&
              !form.formState.errors.root && (
                <div className="text-center text-red-600 text-sm">
                  {formatErrorText(
                    getFirstFormError(form.formState) ||
                    "Please fix the errors above before submitting",
                  )}
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

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || form.formState.isSubmitting}
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>

            <div className="text-center text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-blue-500">
                Login here
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
