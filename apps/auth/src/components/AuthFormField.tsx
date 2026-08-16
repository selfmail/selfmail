import type { ComponentProps } from "react";
import { cn } from "#/libs/utils";

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
					"w-full rounded-full border-2 border-input bg-transparent px-6 py-3 text-foreground outline-none ring-ring/50 transition-colors duration-200 focus-within:border-ring focus-within:ring-2 focus:outline-none",
					error && "border-red-300 ring-red-200 focus-within:border-red-400 dark:border-red-800 dark:ring-red-900 dark:focus-within:border-red-700",
				)}
				id={id}
				name={name}
			/>
			{error ? (
				<p className="px-2 pt-1 text-red-600 text-sm dark:text-red-400" id={errorId}>
					{error}
				</p>
			) : null}
		</div>
	);
}
