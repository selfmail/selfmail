import { Link } from "@tanstack/react-router";

export default function notFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center space-y-3">
			<h3 className="font-medium text-lg">Page not found.</h3>
			<Link className="underline" to="/">
				Go to Home.
			</Link>
		</div>
	);
}
