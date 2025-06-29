import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login, isLoggingIn } = useAuth();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		login({ email, password });
	};

	return (
		<Card className="mx-auto w-full max-w-md border-0 bg-background/95 backdrop-blur">
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
					<Mail className="h-6 w-6 text-white" />
				</div>
				<CardTitle className="font-bold text-2xl">Welcome back</CardTitle>
				<CardDescription>Sign in to your SelfMail account</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email" className="font-medium text-sm">
							Email
						</Label>
						<div className="relative">
							<Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your email"
								className="pl-10"
								required
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password" className="font-medium text-sm">
							Password
						</Label>
						<div className="relative">
							<Lock className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter your password"
								className="pl-10"
								required
							/>
						</div>
					</div>
					<Button
						type="submit"
						className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
						disabled={isLoggingIn}
					>
						{isLoggingIn ? "Signing in..." : "Sign In"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
