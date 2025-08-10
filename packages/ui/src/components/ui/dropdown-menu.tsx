import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "../../lib/utils";

interface DropdownMenuProps extends RadixDropdownMenu.DropdownMenuProps {}

export function DropdownMenu({ ...props }: DropdownMenuProps) {
	return <RadixDropdownMenu.Root {...props} />;
}

export function DropdownMenuTrigger({
	children,
	styled = true,
	...props
}: RadixDropdownMenu.DropdownMenuTriggerProps & {
	styled?: boolean;
}) {
	return (
		<RadixDropdownMenu.Trigger
			className={cn(styled && "", "outline-none")}
			{...props}
		>
			{children}
		</RadixDropdownMenu.Trigger>
	);
}
export function DropdownMenuContent({
	children,
	styled = true,
	...props
}: RadixDropdownMenu.DropdownMenuContentProps & {
	styled?: boolean;
}) {
	return (
		<RadixDropdownMenu.Content
			className={cn(
				styled &&
					"dropdown-fade-in mt-2 min-w-64 rounded-xl bg-[#f5f5f5e4] p-2 shadow-sm backdrop-blur-sm",
			)}
			{...props}
		>
			{children}
		</RadixDropdownMenu.Content>
	);
}

export function DropdownMenuItem({
	children,
	styled = true,
	...props
}: RadixDropdownMenu.DropdownMenuItemProps & {
	styled?: boolean;
	href?: string;
}) {
	return (
		<RadixDropdownMenu.Item
			{...props}
			className={cn(
				styled &&
					"cursor-pointer rounded-md px-2 py-1 text-lg transition-colors duration-75 hover:bg-neutral-200",
				"outline-none",
				props.className,
			)}
		>
			{children}
		</RadixDropdownMenu.Item>
	);
}

export function DropdownMenuSeparator(
	props: RadixDropdownMenu.DropdownMenuSeparatorProps,
) {
	return <RadixDropdownMenu.Separator {...props} />;
}

export function DropdownMenuCheckboxItem({
	children,
	...props
}: RadixDropdownMenu.DropdownMenuCheckboxItemProps) {
	return (
		<RadixDropdownMenu.CheckboxItem {...props}>
			{children}
		</RadixDropdownMenu.CheckboxItem>
	);
}
