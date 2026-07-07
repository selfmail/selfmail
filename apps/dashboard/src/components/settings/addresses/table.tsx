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
  AtSignIcon,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { cn } from "#/lib/utils";
import type { DashboardAddress } from "#/lib/workspaces/types";
import { m } from "#/paraglide/messages";
import { AddressActions } from "./actions";
import { emptyAddresses, getAddressDomain } from "./utils";

interface AddressTableProps {
  addresses?: DashboardAddress[];
  emptyAction: ReactNode;
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

export function AddressTable({ addresses, emptyAction }: AddressTableProps) {
  const columns = useMemo<ColumnDef<DashboardAddress>[]>(
    () => [
      {
        accessorKey: "email",
        header: m["dashboard.settings.member_settings.addresses"](),
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <AtSignIcon aria-hidden="true" className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium text-foreground">
                {row.original.email}
              </div>
              <div className="truncate text-muted-foreground text-xs">
                {row.original.handle}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorFn: (address) => getAddressDomain(address.email),
        header: m["dashboard.address.create.domain_label"](),
        id: "domain",
        cell: ({ row }) => (
          <span className="truncate text-muted-foreground">
            {getAddressDomain(row.original.email)}
          </span>
        ),
      },
      {
        accessorKey: "addressSlug",
        header: "Slug",
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground text-xs tabular-nums">
            {row.original.addressSlug}
          </span>
        ),
      },
      {
        cell: ({ row }) => (
          <div className="flex justify-end">
            <AddressActions email={row.original.email} />
          </div>
        ),
        enableSorting: false,
        header: m["dashboard.settings.member_settings.actions"](),
        id: "actions",
      },
    ],
    []
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data: addresses ?? emptyAddresses,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });
  const rows = table.getRowModel().rows;

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <table className="w-full min-w-lg border-collapse text-left text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  const headerContent = canSort ? (
                    <button
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between gap-3 text-left outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                        sorted && "text-foreground"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                      type="button"
                    >
                      <span className="truncate">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </span>
                      {renderSortIcon(sorted)}
                    </button>
                  ) : (
                    <span className="sr-only">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </span>
                  );

                  return (
                    <th
                      aria-sort={(() => {
                        if (!canSort) {
                          return undefined;
                        }
                        if (sorted === "asc") {
                          return "ascending";
                        }
                        if (sorted === "desc") {
                          return "descending";
                        }
                        return "none";
                      })()}
                      className={cn(
                        "border-border border-b px-4 py-3 font-medium",
                        header.column.id === "actions" && "w-12 text-right"
                      )}
                      key={header.id}
                      scope="col"
                    >
                      {header.isPlaceholder ? null : headerContent}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length ? (
              rows.map((row) => (
                <tr className="hover:bg-muted/40" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      className={cn(
                        "px-4 py-3.5 align-middle",
                        cell.column.id === "actions" && "w-12"
                      )}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-12 text-center" colSpan={columns.length}>
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                    <div>
                      <p className="font-medium">
                        {m["dashboard.address.add"]()}
                      </p>
                      <p className="mt-1 text-pretty text-muted-foreground text-sm">
                        {m["dashboard.address.create.description"]()}
                      </p>
                    </div>
                    {emptyAction}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
