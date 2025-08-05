import type * as React from "react";

type Props = {
	label: string;
	htmlFor: string;
	hint?: string;
	children: React.ReactNode;
};

export function Field({ label, htmlFor, hint, children }: Props) {
	return (
		<div className="space-y-1.5">
			<label
				htmlFor={htmlFor}
				className="block font-medium text-[#0F172A] text-sm"
			>
				{label}
			</label>
			{children}
			{hint ? <p className="text-[#94A3B8] text-xs">{hint}</p> : null}
		</div>
	);
}
