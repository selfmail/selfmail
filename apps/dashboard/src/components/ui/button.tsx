import clsx from "clsx";
import { motion } from "motion/react";
import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "primary" | "secondary" | "ghost";
	loading?: boolean;
	icon?: React.ReactNode;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className, variant = "primary", loading, icon, children, ...props },
		ref,
	) => {
		const base =
			"inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD] disabled:cursor-not-allowed disabled:opacity-60";
		const variants = {
			primary: "bg-[#3B82F6] text-white hover:bg-[#2563EB]",
			secondary:
				"bg-white text-[#0F172A] ring-1 ring-[#E2E8F0] hover:bg-[#F8FAFC]",
			ghost: "bg-transparent text-[#0F172A] hover:bg-[#F1F5F9]",
		} as const;

		return (
			<motion.button
				whileTap={{ scale: 0.98 }}
				type="button"
				ref={ref}
				className={clsx(base, variants[variant], className)}
				{...props}
			>
				{loading ? (
					<Spinner />
				) : (
					<>
						{icon ? <span className="-ml-1">{icon}</span> : null}
						{children}
					</>
				)}
			</motion.button>
		);
	},
);
Button.displayName = "Button";

function Spinner() {
	return (
		<svg
			className="h-4 w-4 animate-spin text-current"
			viewBox="0 0 24 24"
			aria-hidden
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
				fill="none"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
			/>
		</svg>
	);
}
