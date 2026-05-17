import { GripVerticalIcon } from "lucide-react";
import {
	type GroupProps,
	type PanelProps,
	Panel as ResizablePanel,
	Group as ResizablePanelGroup,
	Separator as ResizablePrimitiveHandle,
	type SeparatorProps,
} from "react-resizable-panels";
import { cn } from "#/lib/utils";

type ResizableHandleProps = SeparatorProps & {
	withHandle?: boolean;
};

function ResizableGroup({ className, ...props }: GroupProps) {
	return (
		<ResizablePanelGroup
			className={cn("h-full w-full", className)}
			{...props}
		/>
	);
}

function ResizableHandle({
	className,
	withHandle,
	...props
}: ResizableHandleProps) {
	return (
		<ResizablePrimitiveHandle className={cn("", className)} {...props}>
			{withHandle ? (
				<div className="flex h-8 w-4 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm">
					<GripVerticalIcon className="size-3.5" />
				</div>
			) : null}
		</ResizablePrimitiveHandle>
	);
}

export {
	type PanelProps as ResizablePanelProps,
	ResizableGroup as ResizablePanelGroup,
	ResizableHandle,
	ResizablePanel,
};
