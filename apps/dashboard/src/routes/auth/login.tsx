import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth/login")({
	component: LoginComponent,
});

function LoginComponent() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			await login(email, password);
			navigate({ to: "/second-inbox" });
		} catch {
			setError("Invalid credentials. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
			<div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 md:grid-cols-2">
				{/* Left: Brand / Value props (hidden on mobile) */}
				<motion.aside
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="hidden flex-col justify-between p-10 md:flex lg:p-12"
				>
					<header className="flex items-center gap-3">
						<div className="grid h-9 w-9 place-items-center rounded-lg bg-[#3B82F6] font-semibold text-white">
							S
						</div>
						<div className="font-semibold text-xl tracking-tight">Selfmail</div>
					</header>

					<div className="max-w-md">
						<h1 className="font-semibold text-3xl tracking-tight lg:text-4xl">
							Sign in to Selfmail
						</h1>
						<p className="mt-3 text-[#475569]">
							Clean, fast, and focused email for your team—custom domains,
							shared inboxes, and secure access in a beautiful light UI.
						</p>
						<ul className="mt-6 space-y-2 text-[#475569] text-sm">
							<li>• Deliverability built-in (SPF, DKIM, DMARC)</li>
							<li>• Shared inboxes and internal comments</li>
							<li>• Minimal distractions, keyboard-friendly</li>
						</ul>
					</div>

					<footer className="text-[#94A3B8] text-xs">
						© {new Date().getFullYear()} Selfmail, Inc.
					</footer>
				</motion.aside>

				{/* Right: Auth Card */}
				<main className="flex items-center justify-center p-6 md:p-10 lg:p-12">
					<motion.div
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25, delay: 0.05 }}
						className="w-full max-w-md"
					>
						{/* Mobile brand header */}
						<div className="mb-6 flex items-center gap-3 md:hidden">
							<div className="grid h-8 w-8 place-items-center rounded-md bg-[#3B82F6] font-semibold text-white">
								S
							</div>
							<div className="font-semibold text-lg tracking-tight">
								Selfmail
							</div>
						</div>

						<div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-[#E2E8F0]">
							<div className="mb-6">
								<h2 className="font-semibold text-xl tracking-tight">
									Welcome back
								</h2>
								<p className="mt-1 text-[#475569] text-sm">
									Sign in to your account
								</p>
							</div>

							{error ? (
								<div
									className="mb-4 rounded-md border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-2 text-[#991B1B] text-sm"
									role="alert"
								>
									{error}
								</div>
							) : null}

							<form onSubmit={handleSubmit} className="space-y-4">
								<Field label="Email address" htmlFor="email">
									<Input
										id="email"
										name="email"
										type="email"
										autoComplete="email"
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@company.com"
									/>
								</Field>

								<Field
									label="Password"
									htmlFor="password"
									hint="Use at least 8 characters."
								>
									<Input
										id="password"
										name="password"
										type="password"
										autoComplete="current-password"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="••••••••"
									/>
								</Field>

								<Button type="submit" className="w-full" loading={isLoading}>
									Sign in
								</Button>

								<Divider className="my-4" />

								<p className="text-center text-[#475569] text-sm">
									Don’t have an account?{" "}
									<button
										type="button"
										onClick={() => navigate({ to: "/auth/register" })}
										className="font-medium text-[#3B82F6] hover:underline"
									>
										Sign up
									</button>
								</p>
							</form>
						</div>
					</motion.div>
				</main>
			</div>
		</div>
	);
}
