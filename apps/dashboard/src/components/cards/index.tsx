"use client"

import { useIntersection } from "@mantine/hooks"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useRef } from "react"
import { create } from 'zustand'
import Card from "./card"
import { TEmailData } from "./types"

type State = {
    ids: string[]
}

type Action = {
    setIds: (ids: State['ids']) => void
}

// Create your store, which includes both state and (optionally) actions
export const useCardSelectionStore = create<State & Action>((set) => ({
    ids: [],
    setIds: (ids) => set(() => ({ ids: ids })),
}))

export default function EmailCards({
    fetchEmails
}: {
    fetchEmails: ({ from, size, to }: { from: number, to: number, size: number }) => Promise<{ data: TEmailData[], meta: { totalRowCount: number } }>
}) {

    const { ids, setIds } = useCardSelectionStore()

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
            ],
            queryFn: async ({ pageParam = 0 }) => {
                const start = (pageParam as number) * fetchSize
                const result = await fetchEmails({
                    from: start,
                    size: fetchSize,
                    to: start + fetchSize
                })

                return result
            },
            initialPageParam: 0,
            getNextPageParam: (_lastGroup, groups) => groups.length,
            refetchOnWindowFocus: false,
        })

    const totalRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0


    // infinity scroll
    const lastEmailRef = useRef<HTMLDivElement>(null)

    const { entry, ref } = useIntersection({
        root: lastEmailRef.current,
        threshold: 1
    })

    useEffect(() => {
        if (entry?.isIntersecting) {
            console.log("intersecting")
            fetchNextPage()
        }
    })

    const emails = useMemo(
        () => data?.pages?.flatMap(page => page.data) ?? [],
        [data]
    )

    // number of the fetched emails
    const totalFetched = emails.length

    return (
        <div className="w-[50%] border-r border-r-border overflow-auto">
            <div className="flex flex-col divide-y divide-border border-b border-b-border">
                <div className="flex justify-between items-center px-4 py-2 h-12">
                    <div className="items-center space-x-2 flex">
                        <p className="text-sm text-text-secondary">Selected</p>
                        <p className="text-sm text-text-secondary">{ids.length}</p>
                    </div>
                    {
                        ids.length > 0 && (
                            <button className="bg-primary text-white px-4 py-2 rounded-md" onClick={() => setIds([])}>Clear</button>
                        )
                    }
                </div>
                {
                    emails.map((email, i) => {

                        if (i === emails.length - 1 && i !== totalRowCount - 1) {
                            console.log("last email")
                            return <Card ref={ref} subject={email.subject} sender={email.sender} date={email.date} id={email.id} />
                        }
                        return (
                            <Card id={email.id} subject={email.subject} sender={email.sender} date={email.date} key={email.id} />
                        )
                    })
                }
            </div>
            <p className="py-2 px-4 text-sm text-text-secondary">You see {totalFetched} emails of {data?.pages?.[0]?.meta?.totalRowCount} emails</p>
        </div>
    )
}