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
import { getMembers } from "#/lib/settings/member";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import type { SettingsPageContext } from "../menu/pages";
import { SettingsPage } from "../ui";
import MembersActionButton from "./action";

interface Member {
  createdAt: Date;
  id: string;
  profileName: string;
  isCurrentMember: boolean;
  userId: string;
}

const emptyMembers: Member[] = [];

function getMemberInitials(name: string) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "?";
}

export function MemberSettingsPage({
  description,
  memberId,
  workspaceId,
}: SettingsPageContext) {
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["workspace-members", workspaceId, memberId],
    queryFn: () =>
      getMembers({
        data: {
          workspaceId,
          memberId,
        },
      }),
  });
  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
      {
        accessorKey: "profileName",
        header: m["dashboard.settings.member_settings.member"](),
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground text-xs">
              {getMemberInitials(row.original.profileName)}
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate font-medium text-foreground">
                  {row.original.profileName}
                </span>
                {row.original.isCurrentMember ? (
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs">
                    {m["dashboard.settings.member_settings.you"]()}
                  </span>
                ) : null}
              </div>
              <div className="truncate text-muted-foreground text-xs">
                {row.original.id}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: m["dashboard.settings.member_settings.joined"](),
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {new Intl.DateTimeFormat(getLocale()).format(
              new Date(row.original.createdAt)
            )}
          </span>
        ),
      },
      {
        cell: ({ row }) => (
          <div className="flex justify-end">
            <MembersActionButton
              canRemoveMembers={data?.canRemoveMembers ?? false}
              isCurrentMember={row.original.isCurrentMember}
              joinedAt={row.original.createdAt}
              memberId={row.original.id}
              memberName={row.original.profileName}
              userId={row.original.userId}
            />
          </div>
        ),
        enableSorting: false,
        header: m["dashboard.settings.member_settings.actions"](),
        id: "actions",
      },
    ],
    [data?.canRemoveMembers]
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data: data?.members ?? emptyMembers,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });
  const rows = table.getRowModel().rows;

  function renderSortIcon(sorted: false | "asc" | "desc") {
    if (sorted === "asc") {
      return <ArrowUpIcon className="size-3.5 shrink-0" />;
    }

    if (sorted === "desc") {
      return <ArrowDownIcon className="size-3.5 shrink-0" />;
    }

    return <ArrowUpDownIcon className="size-3.5 shrink-0 opacity-50" />;
  }

  return (
    <SettingsPage
      description={description?.()}
      error={[
        error ? m["dashboard.settings.member_settings.load_error"]() : null,
      ]}
      loading={[isLoading && isFetching]}
      onRetry={() => refetch()}
      retryLabel={m["dashboard.settings.member_settings.retry"]()}
    >
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
                          if (!header.column.getCanSort()) {
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
                  <td
                    className="px-6 py-12 text-center"
                    colSpan={columns.length}
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <div>
                        <p className="font-medium">
                          {m[
                            "dashboard.settings.member_settings.empty_title"
                          ]()}
                        </p>
                        <p className="mt-1 text-muted-foreground text-sm">
                          {m[
                            "dashboard.settings.member_settings.empty_description"
                          ]()}
                        </p>
                      </div>
                      <button
                        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 font-medium text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => refetch()}
                        type="button"
                      >
                        <RefreshCwIcon className="size-4" />
                        {m["dashboard.settings.member_settings.retry"]()}
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
