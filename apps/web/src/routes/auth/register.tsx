import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupItem } from "@/components/ui/input-group";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth/register")({
	component: RouteComponent,
});
// Login form validation schema
const loginSchema = z.object({
	username: z
		.string({ message: "Username is required" })
		.min(3, "Username must be at least 3 characters"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters"),
	email: z.string().email("Invalid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function RouteComponent() {
	const [confirmPassword, setConfirmPassword] = useState("");
	const [password, setPassword] = useState("");
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	const registerUser = useAuth();

	const onSubmit = async (data: LoginFormData) => {
		setPassword(data.password);
		if (data.password !== confirmPassword) return;
		try {
			registerUser.register({
				email: data.email,
				password: data.password,
				name: data.username,
			});
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	return (
		<div className="flex h-screen items-center justify-center bg-neutral-100">
			<div className="flex flex-col gap-2 lg:w-[400px]">
				<form onSubmit={handleSubmit(onSubmit)}>
					<h2 className="mb-4 font-medium text-2xl">Register</h2>
					<InputGroup className="">
						<InputGroupItem
							type="text"
							placeholder="Username"
							place="top"
							{...register("username")}
							aria-invalid={errors.username ? "true" : "false"}
						/>
						<InputGroupItem
							type="email"
							placeholder="Email"
							place="middle"
							{...register("email")}
							aria-invalid={errors.email ? "true" : "false"}
						/>
						<InputGroupItem
							type="password"
							placeholder="Password"
							place="middle"
							{...register("password")}
							aria-invalid={errors.password ? "true" : "false"}
						/>
						<InputGroupItem
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Confirm Password"
							place="bottom"
						/>
					</InputGroup>

					{/* Error messages */}
					{errors.username && (
						<p className="mt-1 text-red-600 text-sm">
							<span className="text-neutral-500">Username:</span>{" "}
							{errors.username.message}
						</p>
					)}
					{errors.email && (
						<p className="mt-1 text-red-600 text-sm">
							<span className="text-neutral-500">Email:</span>{" "}
							{errors.email.message}
						</p>
					)}
					{errors.password && (
						<p className="mt-1 text-red-600 text-sm">
							<span className="text-neutral-500">Password:</span>{" "}
							{errors.password.message}
						</p>
					)}
					{confirmPassword && password !== confirmPassword && (
						<p className="mt-1 text-red-600 text-sm">
							<span className="text-neutral-500">Confirm Password:</span>{" "}
							Passwords do not match
						</p>
					)}

					<div className="mt-4 flex w-full flex-row items-center justify-between">
						<Link to="/auth/login">
							<Button
								variant={"ghost"}
								size={"sm"}
								className="w-min text-start"
								type="button"
							>
								Login
							</Button>
						</Link>
						<Button
							size={"sm"}
							className="w-min text-end"
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Registering..." : "Register"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
