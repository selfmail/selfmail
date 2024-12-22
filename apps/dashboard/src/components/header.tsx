// header for the dashboard (which also serves as sidebar for mobile)

"use client";

import { cn } from "ui/cn";
import { ScrollArea } from "ui/scroll-area";
import { useIsMobile } from "ui/use-is-mobile";

export default function Header({
	children,
}: {
	children: React.ReactNode;
}) {
	const isMobile = useIsMobile();
	return (
		<div
			className={cn(
				"flex flex-col w-full h-[100dvh]",
				isMobile ? "h-screen" : "h-[100dvh]",
			)}
		>
			<div className="lg:h-14  w-full border-b border-border p-5">
				<h2>hey</h2>
			</div>
			<ScrollArea className="h-calc(100dvh-36px) md:h-calc(100vh-56px) w-full rounded-[inherit]">
				{children}
			</ScrollArea>
		</div>
	);
}
