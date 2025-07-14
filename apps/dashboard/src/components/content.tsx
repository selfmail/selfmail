export function Content({ children }: { children: React.ReactNode }) {
	return <div className="relative flex-1">{children}</div>;
}

export function ActionHeader({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-row items-center justify-between gap-4 p-4">
			{children}
		</div>
	);
}

export function MainContent({ children }: { children: React.ReactNode }) {
	return (
		<div className="mx-2 h-[calc(100vh-5vh)] rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl">
			<div className="flex h-[calc(100vh-8rem)] w-full flex-row overflow-hidden rounded-xl">
				{children}
			</div>
		</div>
	);
}
