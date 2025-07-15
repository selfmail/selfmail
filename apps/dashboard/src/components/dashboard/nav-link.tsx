export function NavLink({
	href,
	children,
	className = "",
}: {
	href: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<a
			href={href}
			className={`rounded-md font-medium text-black text-xl ring-neutral-100 transition-all hover:bg-neutral-100 hover:ring-4 ${className}`}
		>
			{children}
		</a>
	);
}
