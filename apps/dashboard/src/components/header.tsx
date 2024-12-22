// header for the dashboard (which also serves as sidebar for mobile)

"use client";

import Link from "next/link";
import { useEffect } from "react";
import { cn } from "ui/cn";
import { ScrollArea } from "ui/scroll-area";
import { useIsMobile } from "ui/use-is-mobile";
import { create } from "zustand";

type Breadcrumb = {
	title: string;
	href: string;
};

type State = {
	breadcrumbs: Breadcrumb[];
	customHeader: React.ReactNode;
};

type Action = {
	updateBreadcrumbs: (breadcrumbs: State["breadcrumbs"]) => void;
	updateCustomHeader: (customHeader: State["customHeader"]) => void;
};

// Create your store, which includes both state and (optionally) actions
const usePersonStore = create<State & Action>((set) => ({
	breadcrumbs: [],
	customHeader: null,
	updateBreadcrumbs: (breadcrumbs) => set(() => ({ breadcrumbs: breadcrumbs })),
	updateCustomHeader: (customHeader) =>
		set(() => ({ customHeader: customHeader })),
}));

export default function Header({
	children,
}: {
	children: React.ReactNode;
}) {
	const isMobile = useIsMobile();
	const { breadcrumbs, customHeader } = usePersonStore();
	return (
		<div
			className={cn(
				"flex flex-col w-full h-[100dvh]",
				isMobile ? "h-screen" : "h-[100dvh]",
			)}
		>
			<div className="lg:h-14 flex items-center justify-between w-full border-b border-border p-5">
				{(customHeader && <>{customHeader}</>) || (
					<div>
						{breadcrumbs.map((breadcrumb) => (
							<Link key={breadcrumb.href} href={breadcrumb.href}>
								{breadcrumb.title}
							</Link>
						))}
					</div>
				)}
			</div>
			<ScrollArea className="h-calc(100dvh-36px) md:h-calc(100vh-56px) w-full rounded-[inherit]">
				{children}
			</ScrollArea>
		</div>
	);
}

// Component to set the breadcrumbs
export const SetHeader = ({
	breadcumbs,
}: {
	breadcumbs: {
		title: string;
		href: string;
	}[];
}) => {
	const { updateBreadcrumbs } = usePersonStore();
	useEffect(() => {
		updateBreadcrumbs(breadcumbs);
	}, [breadcumbs, updateBreadcrumbs]);
	return <></>;
};
