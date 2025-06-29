import { Lock, Mail, User } from "lucide-react";
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

export function RegisterForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { register, isRegistering } = useAuth();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		register({ name, email, password });
	};

	return (
		<Card className="mx-auto w-full max-w-md border-0 bg-background/95 backdrop-blur">
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-teal-600 to-green-600">
					<User className="h-6 w-6 text-white" />
				</div>
				<CardTitle className="font-bold text-2xl">Create Account</CardTitle>
				<CardDescription>Join SelfMail today</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name" className="font-medium text-sm">
							Full Name
						</Label>
						<div className="relative">
							<User className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter your full name"
								className="pl-10"
								required
							/>
						</div>
					</div>
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
								placeholder="Enter your password (min 8 characters)"
								className="pl-10"
								minLength={8}
								required
							/>
						</div>
					</div>
					<Button
						type="submit"
						className="w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700"
						disabled={isRegistering}
					>
						{isRegistering ? "Creating account..." : "Create Account"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
