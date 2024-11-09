"use client"

import { useIntersection } from "@mantine/hooks"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo, useRef } from "react"
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
const useCardSelectionStore = create<State & Action>((set) => ({
    ids: [],
    setIds: (ids) => set(() => ({ ids: ids })),
}))

export default function EmailCards({
    fetchEmails
}: {
    fetchEmails: ({
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
                const fetchedData = await fetchEmails({
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
        })


    // infinity scroll
    const lastEmailRef = useRef<HTMLDivElement>(null)

    const { entry, ref } = useIntersection({
        root: lastEmailRef.current,
        threshold: 1
    })

    if (entry?.isIntersecting) fetchNextPage()

    const emails = useMemo(
        () => data?.pages?.flatMap(page => page.data) ?? [],
        [data]
    )




    // number of the fetched emails
    const totalFetched = emails.length

    return (
        <div>
            <p>You see {totalFetched} emails of {data?.pages?.[0]?.meta?.totalRowCount} emails</p>
            <div className="flex flex-col">
                {
                    emails.map((email, i) => {

                        if (i === emails.length) {
                            return <Card key={email.subject} ref={lastEmailRef} subject={email.subject} />
                        }
                        return (
                            <Card key={email.subject} subject={email.subject} />
                        )
                    })
                }
            </div>
        </div>
    )
}