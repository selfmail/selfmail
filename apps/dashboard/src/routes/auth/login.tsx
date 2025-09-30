import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { useAuth } from "@/lib/auth";
import { client } from "@/lib/client";

export const Route = createFileRoute("/auth/login")({
	component: LoginComponent,
});

// Define the form data structure
type FormData = {
	email: string;
	password: string;
};

function LoginComponent() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const auth = useAuth();

	const navigate = useNavigate();

	const form = useForm<FormData>({
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleSubmit = async (values: FormData) => {
		setIsLoading(true);
		setError("");

		const res = await client.v1.web.authentication.login.post({
			email: values.email,
			password: values.password,
		});

		// Handle response
		if (res.error) {
			console.log(JSON.stringify(res.error, null, 2));
			setError(
				typeof res.error.value === "string"
					? res.error.value
					: (res.error.value?.message ??
						res.error.value?.summary ??
						"An error occurred during login"),
			);
			setIsLoading(false);
			return;
		}

		if (res.status !== 200) {
			setError("An error occurred during login");
			setIsLoading(false);
			return;
		}

		navigate({
			to: "/",
		});
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<div className="w-full max-w-md space-y-4">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4 px-5 md:px-0"
					>
						{auth.isAuthenticated && (
							<Link
								to={"/"}
								className="flex flex-col space-y-2 rounded-md border border-neutral-100 bg-neutral-50 p-4"
							>
								<h2>Welcome Back!</h2>
								<p>Click here to access the dashboard!</p>
							</Link>
						)}
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
							rules={{
								required: "Email is required",
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: "Please enter a valid email address",
								},
							}}
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

						{(error || Object.keys(form.formState.errors).length > 0) && (
							<div className="text-center text-red-600 text-sm">
								{error ||
									form.formState.errors.email?.message ||
									form.formState.errors.password?.message}
							</div>
						)}

						<div className={"flex flex-row items-center space-x-2"}>
							<InfoIcon className={"h-4 w-4 text-muted-foreground"} />
							<p className={"text-muted-foreground text-sm"}>
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

						<div className="text-center text-muted-foreground text-sm">
							Don't have an account?{" "}
							<Link
								search={{ redirectTo: undefined }}
								to="/auth/register"
								className="text-blue-500"
							>
								Register here
							</Link>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
}
