import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";

type TextareaProps = ComponentProps<"textarea">;

function Textarea({ className, ...props }: TextareaProps) {
	return (
		<textarea
			className={cn(
				"flex min-h-20 w-full resize-none rounded-md border border-neutral-100 bg-neutral-100 px-3 py-2 text-sm outline-none ring-offset-background transition-all placeholder:text-muted-foreground hover:bg-neutral-200 focus-visible:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
