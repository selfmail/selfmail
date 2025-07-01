import type { JSX } from "react";
import { cn } from "@/lib/utils";

export interface InputGroupItemProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	place: "top" | "bottom" | "middle";
}

export function InputGroupItem({
	className,
	place,
	...props
}: InputGroupItemProps) {
	return (
		<input
			className={cn(
				"border border-[#eee] bg-white px-3 py-1.5 text-[#555] transition-all focus-visible:border-[#444]",
				place === "top" && "rounded-t-lg",
				place === "bottom" && "rounded-b-lg",
				place === "middle" && "rounded-none",
				className,
			)}
			{...props}
		/>
	);
}

export function InputGroup({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("flex w-full flex-col", className)}>{children}</div>
	);
}
