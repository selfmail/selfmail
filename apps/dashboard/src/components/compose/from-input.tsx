import type { ComponentProps } from "react";
import { cn, Input, Label } from "#/components/ui";

type FromInputProps = ComponentProps<"input">;

export function FromInput({
	className,
	id = "compose-from",
	...props
}: FromInputProps) {
	return (
		<div className="grid gap-2 sm:grid-cols-[4.5rem_1fr] sm:items-center">
			<Label className="text-muted-foreground" htmlFor={id}>
				From
			</Label>
			<Input
				autoComplete="email"
				className={cn(
					"h-10 rounded-lg border-0 bg-muted px-3 text-sm",
					className,
				)}
				id={id}
				inputMode="email"
				name="from"
				placeholder="name@selfmail.app"
				type="email"
				{...props}
			/>
		</div>
	);
}
