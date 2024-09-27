import { cn } from "@/lib/cn";
import {
    useInfiniteQuery
} from '@tanstack/react-query';
import { useVirtualizer } from "@tanstack/react-virtual";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "ui";
import { create } from "zustand";

async function fetchServerPage(
    limit: number,
    offset = 0,
): Promise<{ rows: Array<string>; nextOffset: number }> {
    const rows = new Array(limit)
        .fill(0)
        .map((_, i) => `Async loaded row #${i + offset * limit}`)

    await new Promise((r) => setTimeout(r, 500))

    return { rows, nextOffset: offset + 1 }
}
export type email = {
    id: string;
    sender: string;
    subject: string;
    recipient: string;
    createdAt: Date;
};

// zustand store for the ids from the checked emails
type state = {
    id: string[];
};

type action = {
    setId: (state: state["id"]) => void;
};

/**A store for the ids of the checked emails*/
const useIds = create<state & action>((set) => ({
    id: [],
    setId: async (state) => {
        set(() => ({ id: state }));
    },
}));

export default function VirtualTable({
    counter
}: {
    counter: number
}) {
    const team = useParams() as { team: string } // get the team from the url /[team]/etc
    const router = useRouter();
    const { id, setId } = useIds();

    const {
        status,
        data,
        error,
        isFetching,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ['projects'],
        queryFn: (ctx) => fetchServerPage(10, ctx.pageParam),
        getNextPageParam: (lastGroup) => lastGroup.nextOffset,
        initialPageParam: 0,
    })

    const allRows = data ? data.pages.flatMap((d) => d.rows) : []

    const parentRef = useRef<HTMLDivElement>(null)

    const rowVirtualizer = useVirtualizer({
        count: hasNextPage ? allRows.length + 1 : allRows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 100,
        overscan: 5,
    })

    // biome-ignore lint/correctness/useExhaustiveDependencies: This is a virtualized list and needs this
    useEffect(() => {
        const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse()

        if (!lastItem) {
            return
        }

        if (
            lastItem.index >= allRows.length - 1 &&
            hasNextPage &&
            !isFetchingNextPage
        ) {
            fetchNextPage()
        }
    }, [
        hasNextPage,
        fetchNextPage,
        allRows.length,
        isFetchingNextPage,
        rowVirtualizer.getVirtualItems(),
    ])

    return (
        <div>
            <div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <h2 className="mx-3 text-3xl font-medium">
                            Your Inbox{" "}
                            <span className="ml-2 text-[#666666]">{counter}</span>
                        </h2>
                    </div>
                    <div className="mr-2 flex items-center space-x-2">
                        {id.length > 0 && (
                            <>
                                <Button
                                    variant={"secondary"}
                                    onClick={() => {
                                        for (const i of id) {
                                            (document.getElementById(i) as HTMLInputElement).checked =
                                                false;
                                        }
                                        setId([]);
                                    }}
                                >
                                    Clear Selection
                                </Button>
                                <Button onClick={() => { }} variant="danger">
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {status === 'pending' ? (
                        <p>Loading...</p>
                    ) : status === 'error' ? (
                        <span>Error: {error.message}</span>
                    ) : (
                        <div
                            ref={parentRef}
                            className="List"
                            style={{
                                height: "500px",
                                width: "100%",
                                overflow: 'auto',
                            }}
                        >
                            <div
                                style={{
                                    height: `${rowVirtualizer.getTotalSize()}px`,
                                    width: '100%',
                                    position: 'relative',
                                }}
                            >
                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                    const isLoaderRow = virtualRow.index > allRows.length - 1
                                    const email = allRows[virtualRow.index]

                                    if (!email) return null

                                    return (
                                        <div
                                            key={virtualRow.index}
                                            className={cn(
                                                "relative flex w-full cursor-pointer items-center justify-between border-t-2 border-t-[#cccccc] p-2 hover:bg-gray-100",
                                                // id.includes(email.id) && "bg-gray-100",
                                            )}
                                            style={{
                                                height: `${virtualRow.size}px`,
                                                transform: `translateY(${virtualRow.start}px)`,
                                            }}
                                        >

                                            {/* <Checkbox id={email.id} className="mr-3 z-20" onClick={() => {
                                                setId(
                                                    id.includes(email.id)
                                                        ? id.filter((id) => id !== email.id)
                                                        : [...id, email.id],
                                                );
                                            }}>
                                                <CheckboxIndicator />
                                            </Checkbox> */}
                                            {/* <p
                                                onClick={() => router.push(`/contacts/${email.sender}`)}
                                                onKeyDown={() => router.push(`/contacts/${email.sender}`)}
                                            >
                                                {email.sender}
                                            </p>
                                            <p>{email.subject}</p>
                                            <p>{email.createdAt.toLocaleDateString()}</p> */}
                                            {/* The background div for going to the mail page */}
                                            {/* <div
                                                className="absolute inset-0"
                                                onClick={() => {
                                                    router.push(`${team}/email/${email.id}`);
                                                }}
                                                onKeyDown={() => {
                                                    router.push(`${team}/email/${email.id}`);
                                                }}
                                            /> */}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div>
                {isFetching && !isFetchingNextPage ? 'Background Updating...' : null}
            </div>
        </div>
    )
}