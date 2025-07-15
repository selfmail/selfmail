import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
export function DropdownMenu() {
	return (
		<RadixDropdownMenu.Root>
			<RadixDropdownMenu.Trigger asChild>
				<button type="button">Open Menu</button>
			</RadixDropdownMenu.Trigger>
			<RadixDropdownMenu.Content className="min-w-72 rounded-md border border-neutral-700 bg-neutral-800 p-0.5 shadow-md">
				<RadixDropdownMenu.Item className="rounded-full px-2.5 py-0.5 text-neutral-200 text-sm outline-none focus:bg-neutral-700 focus:text-white">
					Item 1
				</RadixDropdownMenu.Item>
			</RadixDropdownMenu.Content>
		</RadixDropdownMenu.Root>
	);
}
