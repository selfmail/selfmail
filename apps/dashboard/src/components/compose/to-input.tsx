import type { ComponentProps } from "react";
import { cn, Input, Label } from "#/components/ui";
import { m } from "#/paraglide/messages";

type ToInputProps = ComponentProps<"input">;

export function ToInput({
	className,
	id = "compose-to",
	...props
}: ToInputProps) {
	return (
		<div className="grid gap-2 sm:grid-cols-[4.5rem_1fr] sm:items-center">
			<Label className="text-muted-foreground" htmlFor={id}>
				{m["dashboard.compose.to"]()}
			</Label>
			<Input
				autoComplete="email"
				className={cn(
					"h-10 rounded-lg border-0 bg-muted px-3 text-sm",
					className,
				)}
				id={id}
				name="to"
				placeholder={m["dashboard.compose.to_placeholder"]()}
				required
				type="text"
				{...props}
			/>
		</div>
	);
}
