"use client"
import {
    keepPreviousData,
    useInfiniteQuery,
} from '@tanstack/react-query'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    OnChangeFn,
    Row,
    SortingState,
    useReactTable
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TEmailData } from "./types"

export default function Table({
    fetchData
}: {
    fetchData: ({
        from,
        to,
        size
    }: {
        from: number,
        to: number,
        size: number
    }) => Promise<{
        data: TEmailData[],
        meta: {
            totalRowCount: number
        }
    }>
}) {
    const tableContainerRef = useRef<HTMLDivElement>(null)
    const [sorting, setSorting] = useState<SortingState>([])

    const columns = useMemo<ColumnDef<TEmailData>[]>(
        () => [
            {
                accessorKey: "id",
                header: "ID",
                cell: info => info.getValue(),
            },
            {
                accessorKey: 'sender',
                cell: info => info.getValue(),
            },
            {
                accessorKey: "subject",
                header: "Subject",
                cell: info => info.getValue(),
            },
            {
                accessorKey: "date",
                header: "Date",
                cell: info => info.getValue(),
            },
            {
                accessorKey: "destination",
                header: "Destination",
                cell: info => info.getValue(),
            }
        ],
        []
    )

    // define the fetch size, like how many rows to fetch at a time
    const fetchSize = 20

    const { data, fetchNextPage, isFetching, isLoading } =
        useInfiniteQuery<{
            data: TEmailData[],
            meta: {
                totalRowCount: number
            }
        }>({
            queryKey: [
                'emails',
                sorting, //refetch when sorting changes
            ],
            queryFn: async ({ pageParam = 0 }) => {
                const start = (pageParam as number) * fetchSize
                const fetchedData = await fetchData({
                    from: start,
                    size: fetchSize,
                    to: start + fetchSize
                })
                return {
                    data: fetchedData.data,
                    meta: {
                        totalRowCount: fetchedData.data.length
                    }
                }
            },
            initialPageParam: 0,
            getNextPageParam: (_lastGroup, groups) => groups.length,
            refetchOnWindowFocus: false,
            placeholderData: keepPreviousData,
        })

    //flatten the array of arrays from the useInfiniteQuery hook
    const flatData = useMemo(
        () => data?.pages?.flatMap(page => page.data) ?? [],
        [data]
    )
    const totalFetched = flatData.length
    const totalRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0

    //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
    const fetchMoreOnBottomReached = useCallback(
        (containerRefElement?: HTMLDivElement | null) => {
            if (containerRefElement) {
                const { scrollHeight, scrollTop, clientHeight } = containerRefElement
                //once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
                if (
                    scrollHeight - scrollTop - clientHeight < 500 &&
                    !isFetching &&
                    totalFetched < totalRowCount
                ) {
                    fetchNextPage()
                }
            }
        },
        [fetchNextPage, isFetching, totalFetched, totalRowCount]
    )

    //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
    useEffect(() => {
        fetchMoreOnBottomReached(tableContainerRef.current)
    }, [fetchMoreOnBottomReached])

    const table = useReactTable({
        data: flatData,
        columns,
        state: {
            sorting,
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualSorting: true,
        debugTable: true,
    })

    //scroll to top of table when sorting changes
    const handleSortingChange: OnChangeFn<SortingState> = updater => {
        setSorting(updater)
        if (!!table.getRowModel().rows.length) {
            rowVirtualizer.scrollToIndex?.(0)
        }
    }

    //since this table option is derived from table row model state, we're using the table.setOptions utility
    table.setOptions(prev => ({
        ...prev,
        onSortingChange: handleSortingChange,
    }))

    const { rows } = table.getRowModel()

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        estimateSize: () => 33, //estimate row height for accurate scrollbar dragging
        getScrollElement: () => tableContainerRef.current,
        //measure dynamic row height, except in firefox because it measures table border height incorrectly
        measureElement:
            typeof window !== 'undefined' &&
                navigator.userAgent.indexOf('Firefox') === -1
                ? element => element?.getBoundingClientRect().height
                : undefined,
        overscan: 5,
    })

    if (isLoading) {
        return (
            <p>Loading...</p>
        )
    }

    return (
        <div
            onScroll={e => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
            ref={tableContainerRef}
            className="overflow-y-auto relative"
        >
            ({flatData.length} of {totalRowCount} rows fetched)
            <table className="w-full grid">
                {/* Table header */}
                <thead
                    className="sticky grid top-0 z-10 bg-background-tertiary"
                >
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr
                            key={headerGroup.id}
                            style={{ display: 'flex', width: '100%' }}
                        >
                            {headerGroup.headers.map(header => {
                                return (
                                    <th
                                        key={header.id}
                                        style={{
                                            display: 'flex',
                                            width: header.getSize(),
                                        }}
                                    >
                                        <div
                                            {...{
                                                className: header.column.getCanSort()
                                                    ? 'cursor-pointer select-none'
                                                    : '',
                                                onClick: header.column.getToggleSortingHandler(),
                                            }}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: ' 🔼',
                                                desc: ' 🔽',
                                            }[header.column.getIsSorted() as string] ?? null}
                                        </div>
                                    </th>
                                )
                            })}
                        </tr>
                    ))}
                </thead>
                {/* Table body */}
                <tbody
                    style={{
                        display: 'grid',
                        height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
                        position: 'relative', //needed for absolute positioning of rows
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map(virtualRow => {
                        const row = rows[virtualRow.index] as Row<TEmailData>
                        return (
                            <tr
                                data-index={virtualRow.index} //needed for dynamic row height measurement
                                ref={node => rowVirtualizer.measureElement(node)} //measure dynamic row height
                                key={row.id}
                                style={{
                                    display: 'flex',
                                    position: 'absolute',
                                    transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                                    width: '100%',
                                }}
                            >
                                {row.getVisibleCells().map(cell => {
                                    return (
                                        <td
                                            key={cell.id}
                                            style={{
                                                display: 'flex',
                                                width: cell.column.getSize(),
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}