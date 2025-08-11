import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { formatErrorText, getFirstFormError } from "@/lib/form/validation";
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
import { InfoIcon } from "lucide-react";

export const Route = createFileRoute("/auth/login")({
  component: LoginComponent,
  validateSearch: z
    .object({
      redirectTo: z.string().optional(),
      error: z.string().optional(),
    })
    .optional()
    .default({}),
});

const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password must be at most 128 characters long."),
});

function LoginComponent() {
  const search = Route.useSearch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
    criteriaMode: "all",
    delayError: 500,
    reValidateMode: "onChange",
  });

  useEffect(() => {
    // Check if search and search.error exist before using them
    if (search && typeof search.error === "string" && search.error) {
      setError(search.error);
    }
  }, [search]);

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    setIsLoading(true);
    setError("");
    form.clearErrors();

    try {
      const res = await client.v1.web.authentication.login.post({
        email: values.email,
        password: values.password,
      });

      if (res.status !== 200) {
        const status = res.status;
        // Access error message safely from response data
        const message =
          typeof res.data === "object" && res.data
            ? res.error || "An error occurred during login."
            : "An error occurred during login.";

        if (status === 401 || /invalid email or password/i.test(message)) {
          form.setError("root", {
            type: "server",
            message: "Invalid email or password. Please try again.",
          });
        } else if (status === 429 || /too many requests/i.test(message)) {
          form.setError("root", {
            type: "server",
            message: "Too many login attempts. Please try again later.",
          });
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

      window.location.href = (search && search.redirectTo) || "/second-inbox";
    } catch (err) {
      console.error("Login error:", err);
      form.setError("root", {
        type: "server",
        message:
          err instanceof Error
            ? err.message
            : "Network error. Please check your connection and try again.",
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
            <h1 className={"font-bold text-2xl tracking-tight"}>Login</h1>
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
                    <p>{field.toString()}</p>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(error || form.formState.errors.root) && (
              <div className="text-center text-red-600 text-sm">
                {formatErrorText(
                  error ||
                  form.formState.errors.root?.message?.toString() ||
                  "An error occurred during login",
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
              <p className={"text-sm text-muted-foreground"}>
                Forgot your password?{" "}
                <Link to={"/auth/reset-password"} className={"text-blue-500"}>
                  Reset it here
                </Link>
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || form.formState.isSubmitting}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/auth/register" className="text-blue-500">
                Register here
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
