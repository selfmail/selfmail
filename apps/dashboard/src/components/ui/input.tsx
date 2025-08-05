import clsx from "clsx";
import * as React from "react";

export const Input = React.forwardRef<
	HTMLInputElement,
	React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
	return (
		<input
			ref={ref}
			className={clsx(
				"h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-[#0F172A] text-sm outline-none placeholder:text-[#94A3B8] focus:border-[#93C5FD] focus:ring-2 focus:ring-[#93C5FD]",
				className,
			)}
			{...props}
		/>
	);
});
Input.displayName = "Input";
