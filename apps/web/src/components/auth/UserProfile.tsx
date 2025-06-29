import { Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Mail, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export function UserProfile() {
	const { user, isAuthenticated, logout, isLoggingOut } = useAuth();

	if (!isAuthenticated || !user) {
		return null;
	}

	return (
		<Card className="mx-auto w-full max-w-md border-0 bg-background/95 backdrop-blur">
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
					<User className="h-8 w-8 text-white" />
				</div>
				<CardTitle className="font-bold text-2xl">Profile</CardTitle>
				<CardDescription>Your SelfMail account</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-4">
					<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
						<User className="h-5 w-5 text-muted-foreground" />
						<div>
							<p className="font-medium text-muted-foreground text-sm">Name</p>
							<p className="font-medium">{user.name}</p>
						</div>
					</div>

					<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
						<Mail className="h-5 w-5 text-muted-foreground" />
						<div>
							<p className="font-medium text-muted-foreground text-sm">Email</p>
							<p className="font-medium">{user.email}</p>
						</div>
					</div>

					<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
						<Calendar className="h-5 w-5 text-muted-foreground" />
						<div>
							<p className="font-medium text-muted-foreground text-sm">
								Member since
							</p>
							<p className="font-medium">
								{new Date(user.createdAt).toLocaleDateString()}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
						<Shield className="h-5 w-5 text-muted-foreground" />
						<div>
							<p className="font-medium text-muted-foreground text-sm">
								Email verified
							</p>
							<p className="font-medium">{user.emailVerified ? "Yes" : "No"}</p>
						</div>
					</div>
				</div>

				<div className="flex gap-2">
					<Button asChild variant="outline" size="sm">
						<Link to="/">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Home
						</Link>
					</Button>
					<Button
						onClick={() => logout()}
						disabled={isLoggingOut}
						variant="outline"
						size="sm"
						className="flex-1"
					>
						{isLoggingOut ? "Signing out..." : "Sign Out"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
