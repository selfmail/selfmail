import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

interface SettingsSectionProps {
	children: ReactNode;
	description: string;
	title: string;
	titleClassName?: string;
}

export function SettingsSection({
	children,
	description,
	title,
	titleClassName,
}: SettingsSectionProps) {
	return (
		<section className="grid gap-6 border-neutral-200 border-t py-8 lg:grid-cols-[16rem_minmax(0,42rem)] lg:gap-12">
			<div className="flex flex-col gap-1">
				<h2 className={cn("text-balance font-medium text-lg", titleClassName)}>
					{title}
				</h2>
				<p className="text-muted-foreground text-pretty text-sm">
					{description}
				</p>
			</div>
			{children}
		</section>
	);
}
