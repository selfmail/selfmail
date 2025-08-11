import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
  Alert,
  AlertTitle,
  AlertDescription,
} from "ui";
import { z } from "zod";
import { client } from "@/lib/client";
import { InfoIcon } from "lucide-react";

export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPasswordComponent,
  validateSearch: z
    .object({
      email: z.string().email().optional(),
      token: z.string().optional(),
    })
    .optional()
    .default({}),
});

const requestSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

const resetSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters long.")
      .max(128, "Password must be at most 128 characters long."),
    passwordVerification: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.passwordVerification, {
    message: "Passwords do not match.",
    path: ["passwordVerification"],
  });

function ResetPasswordComponent() {
  const search = Route.useSearch();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"request" | "confirm" | "success">(
    search && search.token ? "confirm" : "request",
  );

  // Request form (Step 1)
  const requestForm = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      email: (search && search.email) || "",
    },
    mode: "onChange",
    criteriaMode: "all",
    delayError: 500,
    reValidateMode: "onChange",
  });

  // Reset form (Step 2)
  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      passwordVerification: "",
    },
    mode: "onChange",
    criteriaMode: "all",
    delayError: 500,
    reValidateMode: "onChange",
  });

  const handleRequestReset = async (values: z.infer<typeof requestSchema>) => {
    // Trigger validation before submission
    const isValid = await requestForm.trigger();
    if (!isValid) {
      return; // Don't submit if form is invalid
    }

    setIsLoading(true);
    requestForm.clearErrors();

    try {
      // Note: API endpoint not implemented yet
      // This would call something like:
      // const res = await client.v1.web.authentication.requestPasswordReset.post({
      //   email: values.email,
      // });

      // For now, simulate success
      setTimeout(() => {
        setStep("success");
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      requestForm.setError("root", {
        type: "server",
        message: "Failed to send reset instructions. Please try again later.",
      });
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (values: z.infer<typeof resetSchema>) => {
    // Trigger validation before submission
    const isValid = await resetForm.trigger();
    if (!isValid) {
      return; // Don't submit if form is invalid
    }

    setIsLoading(true);
    resetForm.clearErrors();

    try {
      // Note: API endpoint not implemented yet
      // This would call something like:
      // const res = await client.v1.web.authentication.resetPassword.post({
      //   token: search && search.token,
      //   password: values.password,
      // });

      // For now, simulate success
      setTimeout(() => {
        setStep("success");
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      resetForm.setError("root", {
        type: "server",
        message: "Invalid or expired reset token. Please try again.",
      });
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-4 px-5 md:px-0">
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              {search && search.token
                ? "Your password has been reset successfully. You can now log in with your new password."
                : "Password reset instructions have been sent to your email."}
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => (window.location.href = "/auth/login")}
            className="w-full"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        {step === "request" ? (
          <Form {...requestForm}>
            <form
              onSubmit={requestForm.handleSubmit(handleRequestReset)}
              className="space-y-4 px-5 md:px-0"
            >
              <h1 className={"font-bold text-2xl tracking-tight"}>
                Reset Password
              </h1>
              <p className="text-muted-foreground text-sm">
                Enter your email address below and we'll send you instructions
                to reset your password.
              </p>

              <FormField
                control={requestForm.control}
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

              {requestForm.formState.errors.root && (
                <div className="text-center text-red-600 text-sm">
                  {formatErrorText(
                    requestForm.formState.errors.root.message?.toString() ||
                      "An error occurred. Please try again.",
                  )}
                </div>
              )}

              {requestForm.formState.isSubmitted &&
                !requestForm.formState.isValid &&
                !requestForm.formState.errors.root && (
                  <div className="text-center text-red-600 text-sm">
                    {formatErrorText(
                      getFirstFormError(requestForm.formState) ||
                        "Please fix the errors above before submitting",
                    )}
                  </div>
                )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || requestForm.formState.isSubmitting}
              >
                {isLoading ? "Sending..." : "Send Reset Instructions"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/auth/login" className="text-blue-500">
                  Back to login
                </Link>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...resetForm}>
            <form
              onSubmit={resetForm.handleSubmit(handleResetPassword)}
              className="space-y-4 px-5 md:px-0"
            >
              <h1 className={"font-bold text-2xl tracking-tight"}>
                Reset Password
              </h1>
              <p className="text-muted-foreground text-sm">
                Please enter your new password below.
              </p>

              <FormField
                control={resetForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={resetForm.control}
                name="passwordVerification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {resetForm.formState.errors.root && (
                <div className="text-center text-red-600 text-sm">
                  {formatErrorText(
                    resetForm.formState.errors.root.message?.toString() ||
                      "An error occurred. Please try again.",
                  )}
                </div>
              )}

              {resetForm.formState.isSubmitted &&
                !resetForm.formState.isValid &&
                !resetForm.formState.errors.root && (
                  <div className="text-center text-red-600 text-sm">
                    {formatErrorText(
                      getFirstFormError(resetForm.formState) ||
                        "Please fix the errors above before submitting",
                    )}
                  </div>
                )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || resetForm.formState.isSubmitting}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/auth/login" className="text-blue-500">
                  Back to login
                </Link>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
