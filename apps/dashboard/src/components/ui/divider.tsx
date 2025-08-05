import clsx from "clsx";
import type * as React from "react";

type Props = {
	children?: React.ReactNode;
	className?: string;
};

export function Divider({ children, className }: Props) {
	if (!children) {
		return <hr className={clsx("border-[#E2E8F0]", className)} />;
	}
	return (
		<div className={clsx("relative", className)}>
			<div className="absolute inset-0 flex items-center" aria-hidden="true">
				<div className="w-full border-[#E2E8F0] border-t" />
			</div>
			<div className="relative flex justify-center">
				<span className="bg-white px-3 text-[#475569] text-xs">{children}</span>
			</div>
		</div>
	);
}
