"use client";

import { useEmailStore } from "@/app/(dashboard)/[team]/inbox/content";
import { cn } from "@/lib/cn";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button, Checkbox, CheckboxIndicator } from "ui";
import { create } from "zustand";

export type email = {
  id: string;
  sender: {
    email: string
  };
  subject: string;
  recipient: {
    email: string
  };
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
  setId: (state) => {
    set(() => ({ id: state }));
  },
}));

// function to fetch the emails from the server
const fetchEmails = async ({ action, skip, take, counter }: {
  action: ({ skip, take }: { skip: number, take: number }) => Promise<email[]>,
  skip: number,
  take: number,
  counter: number
}) => {
  console.log(skip, take)
  const data = await action({ skip, take });

  return data
};

/**
 * The table component, here are all of your mails.
 * You can filter and sort the mails.
 */
export default function DataTable({
  counter,
  action
}: {
  counter: number,
  action: ({
    take,
    skip
  }: {
    take: number,
    skip: number
  }) => Promise<email[]>
}) {

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["emails"],
    queryFn: (ctx) => fetchEmails({ action, take: ctx.pageParam, skip: 30, counter }),
    getNextPageParam: (lastPage, allPages) => {
      if (allPages.length + 30 >= counter) {
        return undefined;
      }
      return allPages.flat().length;
    },
    initialPageParam: 0,
  });


  const emails = data?.pages?.flatMap((d, index) => d)

  const lastPostRef = useRef<HTMLDivElement>(null);


  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1
  })

  const { email, setEmail } = useEmailStore()

  useEffect(() => {
    console.log(entry)
    if (entry?.isIntersecting) {
      fetchNextPage()
    }
  }, [entry, fetchNextPage])

  const { id, setId } = useIds();
  const router = useRouter();
  const { team } = useParams() as { team: string } // get the team from the url /[team]/etc
  return (
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
        {emails?.map((page, i) => {
          if (emails.length === 0) return (
            <div className="mx-3 flex items-center space-x-2 text-[#666666]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-400" />
              <p>We are listening on emails for you...</p>
            </div>
          )
          if (i === emails.length - 1) {
            console.log("last element")
            return (
              <div
                ref={ref}
                key={page.id}
                className={cn(
                  "relative flex w-full cursor-pointer items-center justify-between border-t-2 border-t-[#cccccc] p-2 hover:bg-gray-100",
                  id.includes(page.id) && "bg-gray-100",
                )}
              >

                <Checkbox id={page.id} className="mr-3 z-20" onClick={() => {
                  setId(
                    id.includes(page.id)
                      ? id.filter((id) => id !== page.id)
                      : [...id, page.id],
                  );
                }}>
                  <CheckboxIndicator />
                </Checkbox>
                <p
                  onClick={() => router.push(`/contacts/${page.sender.email}`)}
                  onKeyDown={() => router.push(`/contacts/${page.sender.email}`)}
                >
                  {page.sender.email}
                </p>
                <p>{page.subject}</p>
                <p>{page.createdAt.toLocaleDateString()}</p>
                <div
                  className="absolute inset-0"
                  onClick={() => {
                    setEmail(page.id)
                  }}
                  onKeyDown={() => {
                    setEmail(page.id)
                  }}
                />
              </div>
            )
          }
          return (
            <div
              key={page.id}
              className={cn(
                "relative flex w-full cursor-pointer items-center justify-between border-t-2 border-t-[#cccccc] p-2 hover:bg-gray-100",
                id.includes(page.id) && "bg-gray-100",
              )}
            >

              <Checkbox id={page.id} className="mr-3 z-20" onClick={() => {
                setId(
                  id.includes(page.id)
                    ? id.filter((id) => id !== page.id)
                    : [...id, page.id],
                );
              }}>
                <CheckboxIndicator />
              </Checkbox>
              <p
                onClick={() => router.push(`/contacts/${page.sender}`)}
                onKeyDown={() => router.push(`/contacts/${page.sender}`)}
              >
                {page.sender.email}
              </p>
              <p>{page.subject}</p>
              <p>{page.createdAt.toLocaleDateString()}</p>
              <div
                className="absolute inset-0"
                onClick={() => {
                  setEmail(page.id)
                }}
                onKeyDown={() => {
                  setEmail(page.id)
                }}
              />
            </div>
          )
        })}
        {

        }
        {
          (
            !hasNextPage && !isFetchingNextPage &&
            <div className="w-full flex border-t-2 border-t-[#cccccc] p-2 items-center space-x-2 text-[#666666]">
              <h2>You have reached the end of your emails. Congratulations.</h2>
            </div>
          ) || (isFetchingNextPage) && (
            <div className="w-full flex border-t-2 border-t-[#cccccc] p-2 items-center space-x-2 text-[#666666]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              <h2>fetching more emails...</h2>
            </div>
          )
        }

      </div>
    </div >
  );
}
