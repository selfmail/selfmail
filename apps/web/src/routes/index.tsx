import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Globe, Mail, Shield, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	console.log(import.meta.env.VITE_SERVER_URL);
	// Fetch health check status from the server
	const { user, isAuthenticated, logout, isLoading } = useAuth();

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 animate-gradient-x bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10" />
				<div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8">
					<div className="text-center">
						<h1 className="font-bold text-4xl tracking-tight sm:text-6xl lg:text-7xl">
							<span className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
								SelfMail
							</span>
						</h1>
						<p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
							The modern email platform built for developers. Fast, secure, and
							beautifully designed.
						</p>
						<div className="mt-10 flex items-center justify-center gap-4">
							{isAuthenticated ? (
								<Button
									size="lg"
									className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
								>
									Go to Dashboard
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							) : (
								<>
									<Button
										size="lg"
										asChild
										className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
									>
										<Link to="/auth/login">Get Started</Link>
									</Button>
									<Button variant="outline" size="lg">
										Learn More
									</Button>
								</>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-24 sm:py-32">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
							Built for the modern web
						</h2>
						<p className="mt-4 text-lg text-muted-foreground">
							Everything you need to manage emails at scale
						</p>
					</div>

					<div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
						<Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="rounded-lg bg-purple-500/10 p-3">
										<Zap className="h-6 w-6 text-purple-600" />
									</div>
									<div>
										<h3 className="font-semibold">Lightning Fast</h3>
										<p className="text-muted-foreground text-sm">
											Built with modern technologies for optimal performance
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50/50 to-teal-50/50 dark:from-blue-950/20 dark:to-teal-950/20">
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="rounded-lg bg-blue-500/10 p-3">
										<Shield className="h-6 w-6 text-blue-600" />
									</div>
									<div>
										<h3 className="font-semibold">Secure by Default</h3>
										<p className="text-muted-foreground text-sm">
											Enterprise-grade security with end-to-end encryption
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="relative overflow-hidden border-0 bg-gradient-to-br from-teal-50/50 to-green-50/50 dark:from-teal-950/20 dark:to-green-950/20">
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="rounded-lg bg-teal-500/10 p-3">
										<Globe className="h-6 w-6 text-teal-600" />
									</div>
									<div>
										<h3 className="font-semibold">Global Scale</h3>
										<p className="text-muted-foreground text-sm">
											Deliver emails worldwide with 99.9% uptime
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Status Section */}
			<section className="py-16">
				<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
					<div className="grid gap-6 md:grid-cols-2">
						{/* API Status Card */}
						<Card className="border-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-semibold">API Status</h3>
										<div className="mt-2 flex items-center gap-2">
											<div
												className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
											/>
											<span className="text-muted-foreground text-sm">
												{healthCheck.isLoading
													? "Checking..."
													: healthCheck.data
														? "All systems operational"
														: "Service unavailable"}
											</span>
										</div>
									</div>
									<div className="rounded-lg bg-green-500/10 p-3">
										<Globe className="h-6 w-6 text-green-600" />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* User Status Card */}
						<Card className="border-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
							<CardContent className="p-6">
								{isLoading ? (
									<div className="flex items-center gap-4">
										<div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
										<div className="space-y-2">
											<div className="h-4 w-20 animate-pulse rounded bg-muted" />
											<div className="h-3 w-32 animate-pulse rounded bg-muted" />
										</div>
									</div>
								) : isAuthenticated && user ? (
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold">Welcome back!</h3>
											<p className="text-muted-foreground text-sm">
												{user.name}
											</p>
											<p className="text-muted-foreground text-xs">
												{user.email}
											</p>
											<Button
												variant="outline"
												size="sm"
												className="mt-3"
												onClick={() => logout()}
											>
												Sign Out
											</Button>
										</div>
										<div className="rounded-lg bg-blue-500/10 p-3">
											<Users className="h-6 w-6 text-blue-600" />
										</div>
									</div>
								) : (
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold">Get Started</h3>
											<p className="text-muted-foreground text-sm">
												Create your account today
											</p>
											<Button asChild size="sm" className="mt-3">
												<Link to="/auth/login">Sign In / Register</Link>
											</Button>
										</div>
										<div className="rounded-lg bg-blue-500/10 p-3">
											<Mail className="h-6 w-6 text-blue-600" />
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-border/40 border-t py-12">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<p className="text-muted-foreground text-sm">
							Built with ❤️ using React, TypeScript, and tRPC
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
