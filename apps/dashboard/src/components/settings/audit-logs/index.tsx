import { useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowDownIcon,
	ArrowUpDownIcon,
	ArrowUpIcon,
	RefreshCwIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { getAuditLogs } from "#/lib/settings/audit-logs";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import type { SettingsPageContext } from "../menu/pages";
import { SettingsPage } from "../ui";

type AuditLog = Awaited<ReturnType<typeof getAuditLogs>>[number];

const emptyAuditLogs: AuditLog[] = [];

function formatAction(action: string) {
	return action
		.split(".")
		.flatMap((part) => part.split("_"))
		.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
		.join(" ");
}

function renderSortIcon(sorted: false | "asc" | "desc") {
	if (sorted === "asc") {
		return <ArrowUpIcon className="size-3.5 shrink-0" />;
	}

	if (sorted === "desc") {
		return <ArrowDownIcon className="size-3.5 shrink-0" />;
	}

	return <ArrowUpDownIcon className="size-3.5 shrink-0 opacity-50" />;
}

export function AuditLogsSettingsPage({
	description,
	memberId,
}: SettingsPageContext) {
	const { data, error, isFetching, isLoading, refetch } = useQuery({
		queryKey: ["workspace-audit-logs", memberId],
		queryFn: () => getAuditLogs({ data: { memberId } }),
	});
	const columns = useMemo<ColumnDef<AuditLog>[]>(
		() => [
			{
				accessorKey: "action",
				header: m["dashboard.settings.audit_logs.event"](),
				cell: ({ row }) => (
					<div className="truncate font-medium text-foreground">
						{formatAction(row.original.action)}
					</div>
				),
			},
			{
				accessorFn: (log) => log.actorEmail ?? log.actorType,
				header: m["dashboard.settings.audit_logs.actor"](),
				id: "actor",
				cell: ({ row }) => (
					<div className="min-w-0">
						<div className="truncate text-foreground">
							{row.original.actorEmail ?? row.original.actorType}
						</div>
						<div className="truncate text-muted-foreground text-xs">
							{row.original.actorType}
						</div>
					</div>
				),
			},
			{
				accessorFn: (log) => log.targetType ?? "",
				header: m["dashboard.settings.audit_logs.target"](),
				id: "target",
				cell: ({ row }) =>
					row.original.targetType ? (
						<span className="truncate text-foreground">
							{row.original.targetType}
						</span>
					) : (
						<span className="text-muted-foreground">—</span>
					),
			},
			{
				accessorKey: "createdAt",
				header: m["dashboard.settings.audit_logs.date"](),
				cell: ({ row }) => (
					<time
						className="whitespace-nowrap text-muted-foreground tabular-nums"
						dateTime={new Date(row.original.createdAt).toISOString()}
					>
						{new Intl.DateTimeFormat(getLocale(), {
							dateStyle: "medium",
							timeStyle: "short",
						}).format(new Date(row.original.createdAt))}
					</time>
				),
			},
		],
		[],
	);
	const [sorting, setSorting] = useState<SortingState>([]);
	const table = useReactTable({
		columns,
		data: data ?? emptyAuditLogs,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id,
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: { sorting },
	});

	return (
		<SettingsPage
			description={description?.()}
			error={[error ? m["dashboard.settings.audit_logs.load_error"]() : null]}
			loading={[isLoading && isFetching]}
			onRetry={() => refetch()}
			retryLabel={m["dashboard.settings.retry"]()}
		>
			<div className="min-h-0 w-full min-w-0 flex-1 overflow-auto">
				<div className="min-w-3xl overflow-hidden rounded-xl border border-border bg-background">
					<table className="w-full border-collapse text-left text-sm">
						<thead className="bg-muted/60 text-muted-foreground">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										const sorted = header.column.getIsSorted();
										return (
											<th
												aria-sort={
													sorted === "asc"
														? "ascending"
														: sorted === "desc"
															? "descending"
															: "none"
												}
												className="border-border border-b px-4 py-3 font-medium"
												key={header.id}
												scope="col"
											>
												<button
													className={cn(
														"flex w-full cursor-pointer items-center justify-between gap-3 text-left outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
														sorted && "text-foreground",
													)}
													onClick={header.column.getToggleSortingHandler()}
													type="button"
												>
													<span className="truncate">
														{flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
													</span>
													{renderSortIcon(sorted)}
												</button>
											</th>
										);
									})}
								</tr>
							))}
						</thead>
						<tbody className="divide-y divide-border">
							{table.getRowModel().rows.length ? (
								table.getRowModel().rows.map((row) => (
									<tr className="hover:bg-muted/40" key={row.id}>
										{row.getVisibleCells().map((cell) => (
											<td className="px-4 py-3.5 align-middle" key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</td>
										))}
									</tr>
								))
							) : (
								<tr>
									<td
										className="px-6 py-12 text-center"
										colSpan={columns.length}
									>
										<div className="mx-auto flex max-w-sm flex-col items-center gap-3">
											<div>
												<p className="font-medium">
													{m["dashboard.settings.audit_logs.empty_title"]()}
												</p>
												<p className="mt-1 text-pretty text-muted-foreground text-sm">
													{m[
														"dashboard.settings.audit_logs.empty_description"
													]()}
												</p>
											</div>
											<button
												className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 font-medium text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
												onClick={() => refetch()}
												type="button"
											>
												<RefreshCwIcon aria-hidden="true" className="size-4" />
												{m["dashboard.settings.retry"]()}
											</button>
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</SettingsPage>
	);
}
