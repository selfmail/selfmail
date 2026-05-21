import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";

type InputProps = ComponentProps<"input">;

function Input({ className, type = "text", ...props }: InputProps) {
	return (
		<input
			className={cn(
				"flex h-9 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm outline-none ring-offset-background transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground hover:bg-accent focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			type={type}
			{...props}
		/>
	);
}

export { Input };
