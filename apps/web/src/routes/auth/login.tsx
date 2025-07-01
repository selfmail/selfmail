import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupItem } from "@/components/ui/input-group";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth/login")({
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
	const [emailLoop, setEmailLoop] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	const { login } = useAuth();

	const onSubmit = async (data: LoginFormData) => {
		try {
			login({
				email: data.email,
				password: data.password,
				emailLoop,
				username: data.username,
			});
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	return (
		<div className="flex h-screen items-center justify-center bg-neutral-100">
			<div className="flex flex-col gap-2 lg:w-[400px]">
				<form onSubmit={handleSubmit(onSubmit)}>
					<h2 className="mb-4 font-medium text-2xl">Login</h2>
					<button
						type="button"
						onClick={() => setEmailLoop(!emailLoop)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setEmailLoop(!emailLoop);
							}
						}}
						className={cn(
							"cusror-pointer mb-2 flex w-full flex-col items-center justify-start gap-0.5 rounded-xl border border-[#eee] bg-white p-4 text-start shadow-sm ring-0 active:scale-[99.5%]",
							emailLoop && " ring-2 ring-blue-500",
						)}
					>
						<h3 className="font-medium text-base">
							We are launching mails soon!
						</h3>
						<p className="text-start text-[#555] text-sm">
							Click to keep me in the loop!
						</p>
					</button>
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
							place="bottom"
							{...register("password")}
							aria-invalid={errors.password ? "true" : "false"}
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

					<div className="mt-4 flex w-full flex-row items-center justify-between">
						<Link to="/auth/register">
							<Button
								variant={"ghost"}
								size={"sm"}
								className="w-min text-start"
								type="button"
							>
								Register
							</Button>
						</Link>
						<Button
							size={"sm"}
							className="w-min text-end"
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Logging in..." : "Login"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
