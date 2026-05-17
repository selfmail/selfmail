import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";

type TextareaProps = ComponentProps<"textarea">;

function Textarea({ className, ...props }: TextareaProps) {
	return (
		<textarea
			className={cn(
				"flex min-h-20 w-full resize-none rounded-md border border-input bg-muted px-3 py-2 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
