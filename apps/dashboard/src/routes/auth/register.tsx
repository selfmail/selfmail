import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
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

const registerSchema = z.object({
	email: z
		.string()
		.email("Please enter a valid email address")
		.max(128, "Email must be at most 128 characters long."),
	name: z
		.string()
		.min(1, "Name is required")
		.max(50, "Name must be at most 50 characters long."),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters long.")
		.max(128, "Password must be at most 128 characters long."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterComponent() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const form = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleSubmit = async (values: RegisterFormValues) => {
		setIsLoading(true);
		setError("");

		try {
			const res = await client.v1.web.authentication.login.post({
				email: values.email,
				password: values.password,
			});

			if (res.status !== 200 || res.error) {
				setError(
					"sjfjd" ??
						"An error occurred during register. Your email may already be registered.",
				);
				setIsLoading(false);
				return;
			}

			window.location.href = "/second-inbox";
		} catch {
			setError(".");
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
						className="space-y-4"
					>
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
						{error && (
							<div className="text-center text-red-600 text-sm">{error}</div>
						)}
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Logging in..." : "Login"}
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
