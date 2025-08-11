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
import { client } from "@/lib/client";

export const Route = createFileRoute("/auth/register")({
	component: RegisterComponent,
});

// Define the form data structure
type FormData = {
	email: string;
	name: string;
	password: string;
	passwordVerification: string;
};

function RegisterComponent() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const navigation = useNavigate();

	const form = useForm<FormData>({
		defaultValues: {
			email: "",
			password: "",
			name: "",
			passwordVerification: "",
		},
	});

	const handleSubmit = async (values: FormData) => {
		setIsLoading(true);
		setError("");

		const res = await client.v1.web.authentication.register.post({
			email: values.email,
			password: values.password,
			name: values.name,
		});

		if (res.error) {
			setError(
				typeof res.error.value === "string"
					? res.error.value
					: "An error occurred during registration",
			);
			setIsLoading(false);
			return;
		}

		if (res.status !== 200) {
			setError("An error occurred during registration");
			setIsLoading(false);
			return;
		}

		navigation({
			to: "/second-inbox",
		});
	};

	// Simplified error handling
	const firstErrorKey = Object.keys(form.formState.errors)[0] as
		| keyof FormData
		| undefined;
	const firstErrorMessage =
		firstErrorKey && form.formState.errors[firstErrorKey]
			? form.formState.errors[firstErrorKey]?.message
			: null;

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
							rules={{
								required: "Name is required",
								maxLength: {
									value: 50,
									message: "Name must be at most 50 characters long.",
								},
							}}
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
							rules={{
								required: "Please confirm your password",
								validate: (value) =>
									value === form.getValues("password") ||
									"Passwords do not match",
							}}
						/>

						<div className="text-red-500">{error || firstErrorMessage}</div>

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
							{isLoading || form.formState.isSubmitting
								? "Registering..."
								: "Register"}
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
