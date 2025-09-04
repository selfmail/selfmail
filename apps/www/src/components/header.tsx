export default function Header() {
	return (
		<header className="bg-white px-5 py-3">
			<div className="mx-auto max-w-7xl">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<div className="flex items-center">
						<a href="/" className="logo text-black text-xl no-underline">
							Selfmail®
						</a>
					</div>

					{/* Navigation Links - Center */}
					<nav className="flex items-center space-x-8">
						<a
							href="/features"
							className="rounded-full bg-neutral-100 px-4 py-0.5 text-neutral-800"
						>
							Features
						</a>
						<a
							href="/company"
							className="rounded-full bg-neutral-100 px-4 py-0.5 text-neutral-800"
						>
							Company
						</a>
						<a
							href="/pricing"
							className="rounded-full bg-neutral-100 px-4 py-0.5 text-neutral-800"
						>
							Pricing
						</a>
						<a
							href="/updates"
							className="rounded-full bg-neutral-100 px-4 py-0.5 text-neutral-800"
						>
							Updates
						</a>
					</nav>

					{/* Get Started Button */}
					<div className="flex items-center">
						<a
							href="/get-started"
							className="rounded-full border-x-2 border-x-neutral-400 bg-black px-6 py-2 text-white no-underline transition hover:border-x-neutral-500 hover:bg-neutral-800"
						>
							Get Started
						</a>
					</div>
				</div>
			</div>
		</header>
	);
}
