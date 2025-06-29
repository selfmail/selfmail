import { Link } from "@tanstack/react-router";
import { Mail, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

export default function Header() {
	const { isAuthenticated, user } = useAuth();

	const navigation = [{ to: "/", label: "Home" }];

	return (
		<header className="sticky top-0 z-50 w-full border-border/40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* Logo and Navigation */}
				<div className="flex items-center gap-6">
					<Link to="/" className="flex items-center gap-2 font-bold text-xl">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
							<Mail className="h-4 w-4 text-white" />
						</div>
						<span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
							SelfMail
						</span>
					</Link>
					<nav className="hidden gap-6 md:flex">
						{navigation.map(({ to, label }) => (
							<Link
								key={to}
								to={to}
								className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
							>
								{label}
							</Link>
						))}
					</nav>
				</div>

				{/* Right side */}
				<div className="flex items-center gap-3">
					{isAuthenticated && user ? (
						<div className="hidden items-center gap-2 rounded-full bg-muted px-3 py-1.5 sm:flex">
							<User className="h-4 w-4 text-muted-foreground" />
							<span className="font-medium text-sm">{user.name}</span>
						</div>
					) : (
						<Button asChild size="sm" className="hidden sm:inline-flex">
							<Link to="/auth">Sign In</Link>
						</Button>
					)}
					<ModeToggle />
				</div>
			</div>
		</header>
	);
}
