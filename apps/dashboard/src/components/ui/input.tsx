import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";

type InputProps = ComponentProps<"input">;

function Input({ className, type = "text", ...props }: InputProps) {
	return (
		<input
			className={cn(
				"flex h-9 w-full rounded-md border border-neutral-100 bg-neutral-100 px-3 py-2 text-sm outline-none ring-offset-background transition-all file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground hover:bg-neutral-200 focus-visible:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			type={type}
			{...props}
		/>
	);
}

export { Input };
