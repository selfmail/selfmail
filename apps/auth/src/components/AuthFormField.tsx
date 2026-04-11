import type { ComponentProps } from "react";
import { cn } from "#/lib/utils";

type AuthFormFieldProps = Omit<ComponentProps<"input">, "className"> & {
	error?: string;
};

export function AuthFormField({
	error,
	id,
	name,
	...props
}: AuthFormFieldProps) {
	const errorId = error ? `${id ?? name}-error` : undefined;

	return (
		<div>
			<input
				{...props}
				aria-describedby={errorId}
				aria-invalid={Boolean(error)}
				className={cn(
					"w-full rounded-full border-2 border-neutral-200 px-6 py-3 outline-none ring-neutral-200 transition-colors duration-200 focus-within:border-neutral-400 focus-within:ring-2 focus:outline-none",
					error && "border-red-300 ring-red-200 focus-within:border-red-400",
				)}
				id={id}
				name={name}
			/>
			{error ? (
				<p className="px-2 pt-1 text-red-600 text-sm" id={errorId}>
					{error}
				</p>
			) : null}
		</div>
	);
}
