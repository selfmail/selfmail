import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive";
type ButtonSize = "default" | "icon";

const buttonVariants = ({
	className,
	size = "default",
	variant = "default",
}: {
	className?: string;
	size?: ButtonSize;
	variant?: ButtonVariant;
} = {}) =>
	cn(
		"inline-flex cursor-pointer items-center justify-center rounded-xl font-medium outline-none transition-transform transition-colors active:scale-97 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
		size === "default" && "px-4 py-1 text-lg",
		size === "icon" && "size-9 p-0",
		variant === "default" &&
			"bg-neutral-800 text-white hover:bg-neutral-700 disabled:bg-neutral-600",
		variant === "outline" &&
			"border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
		variant === "ghost" && "text-neutral-700 hover:bg-neutral-100",
		variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
		className,
	);

type ButtonProps = ComponentProps<"button"> & {
	size?: ButtonSize;
	variant?: ButtonVariant;
};

function Button({
	className,
	size = "default",
	type = "button",
	variant = "default",
	...props
}: ButtonProps) {
	return (
		<button
			className={buttonVariants({ className, size, variant })}
			type={type}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
