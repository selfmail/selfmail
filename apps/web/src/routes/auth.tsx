import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { UserProfile } from "@/components/auth/UserProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
	component: AuthPage,
});

function AuthPage() {
	const [isLogin, setIsLogin] = useState(true);
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
				<Card className="w-full max-w-md border-0 bg-background/95 backdrop-blur">
					<CardContent className="flex items-center justify-center p-12">
						<div className="flex items-center gap-2">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
							<p className="text-muted-foreground text-sm">Loading...</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isAuthenticated) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
				<div className="w-full max-w-md">
					<UserProfile />
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
			<div className="w-full max-w-md space-y-6">
				{/* Auth Form */}
				<div className="relative">
					<div className="absolute inset-0 animate-gradient-x bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-teal-500/20 blur-xl" />
					<div className="relative">
						{isLogin ? <LoginForm /> : <RegisterForm />}
					</div>
				</div>

				{/* Toggle Card */}
				<Card className="border-0 bg-background/95 backdrop-blur">
					<CardContent className="pt-6">
						<div className="text-center">
							{isLogin ? (
								<>
									<p className="text-muted-foreground text-sm">
										Don't have an account?
									</p>
									<Button
										variant="link"
										onClick={() => setIsLogin(false)}
										className="h-auto p-0"
									>
										Create one here
									</Button>
								</>
							) : (
								<>
									<p className="text-muted-foreground text-sm">
										Already have an account?
									</p>
									<Button
										variant="link"
										onClick={() => setIsLogin(true)}
										className="h-auto p-0"
									>
										Sign in here
									</Button>
								</>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
