import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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

export const Route = createFileRoute("/auth/reset-password")({
	component: ResetPasswordComponent,
});

// Define form data types
type RequestFormData = {
	email: string;
};

type ResetFormData = {
	password: string;
	passwordVerification: string;
};

function ResetPasswordComponent() {
	const search = Route.useSearch() || {};
	const [isLoading, setIsLoading] = useState(false);
	const [step, setStep] = useState<"request" | "confirm" | "success">(
		search && "token" in search ? "confirm" : "request",
	);

	// Request form (Step 1)
	const requestForm = useForm<RequestFormData>({
		defaultValues: {
			email:
				search && "email" in search && typeof search.email === "string"
					? search.email
					: "",
		},
		mode: "onChange",
	});

	// Reset form (Step 2)
	const resetForm = useForm<ResetFormData>({
		defaultValues: {
			password: "",
			passwordVerification: "",
		},
		mode: "onChange",
	});

	const handleRequestReset = async () => {
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
			//   email: requestForm.getValues("email"),
			// });

			// For now, simulate success
			setTimeout(() => {
				setStep("success");
				setIsLoading(false);
			}, 1000);
		} catch (_) {
			requestForm.setError("root", {
				type: "server",
				message: "Failed to send reset instructions. Please try again later.",
			});
			setIsLoading(false);
		}
	};

	const handleResetPassword = async () => {
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
			//   token: search && 'token' in search ? search.token : undefined,
			//   password: resetForm.getValues("password"),
			// });

			// For now, simulate success
			setTimeout(() => {
				setStep("success");
				setIsLoading(false);
			}, 1000);
		} catch (_) {
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
					<Alert className="border-green-200 bg-green-50">
						<AlertTitle>Success</AlertTitle>
						<AlertDescription>
							{"token" in search
								? "Your password has been reset successfully. You can now log in with your new password."
								: "Password reset instructions have been sent to your email."}
						</AlertDescription>
					</Alert>
					<Button
						onClick={() => {
							window.location.href = "/auth/login";
						}}
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
								rules={{
									required: "Email is required",
									pattern: {
										value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
										message: "Please enter a valid email address",
									},
								}}
							/>

							{requestForm.formState.errors.root && (
								<div className="text-center text-red-600 text-sm">
									{requestForm.formState.errors.root.message?.toString() ||
										"An error occurred. Please try again."}
								</div>
							)}

							{requestForm.formState.isSubmitted &&
								!requestForm.formState.isValid &&
								!requestForm.formState.errors.root && (
									<div className="text-center text-red-600 text-sm">
										{requestForm.formState.errors.email?.message?.toString() ||
											"Please fix the errors above before submitting"}
									</div>
								)}

							<Button
								type="submit"
								className="w-full"
								disabled={isLoading || requestForm.formState.isSubmitting}
							>
								{isLoading ? "Sending..." : "Send Reset Instructions"}
							</Button>

							<div className="text-center text-muted-foreground text-sm">
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
								rules={{
									required: "Password is required",
									minLength: {
										value: 8,
										message: "Password must be at least 8 characters long.",
									},
									maxLength: {
										value: 128,
										message: "Password must be at most 128 characters long.",
									},
								}}
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
								rules={{
									required: "Please confirm your password",
									validate: (value) =>
										value === resetForm.getValues("password") ||
										"Passwords do not match",
								}}
							/>

							{resetForm.formState.errors.root && (
								<div className="text-center text-red-600 text-sm">
									{resetForm.formState.errors.root.message?.toString() ||
										"An error occurred. Please try again."}
								</div>
							)}

							{resetForm.formState.isSubmitted &&
								!resetForm.formState.isValid &&
								!resetForm.formState.errors.root && (
									<div className="text-center text-red-600 text-sm">
										{resetForm.formState.errors.password?.message?.toString() ||
											resetForm.formState.errors.passwordVerification?.message?.toString() ||
											"Please fix the errors above before submitting"}
									</div>
								)}

							<Button
								type="submit"
								className="w-full"
								disabled={isLoading || resetForm.formState.isSubmitting}
							>
								{isLoading ? "Resetting..." : "Reset Password"}
							</Button>

							<div className="text-center text-muted-foreground text-sm">
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
