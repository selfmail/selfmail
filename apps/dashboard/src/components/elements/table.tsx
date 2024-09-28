"use client";

import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "ui";
import { create } from "zustand";

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

// function to fetch the emails from the server
const fetchEmails = async ({ action, from, list, counter }: {
  action: ({ from, list }: { from: number, list: number }) => Promise<email[]>,
  from: number,
  list: number,
  counter: number
}) => {
  console.log(from, list)
  const data = await action({ from, list });

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
    from,
    list
  }: {
    from: number,
    list: number
  }) => Promise<email[]>
}) {

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["emails"],
    queryFn: (ctx) => fetchEmails({ action, from: ctx.pageParam, list: 2, counter }),
    getNextPageParam: (lastPage, allPages) => {
      if (allPages.length + 2 >= counter) {
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
          console.log(emails.length, i)
          if (i === emails.length - 1) {
            console.log("last element")
            return (
              <div ref={ref} key={page?.id}>
                {page?.subject} {page?.sender}
              </div>
            )
          }
          return (
            <div key={page?.id}>
              {page?.subject} {page?.sender}
            </div>
          )
        })}
        {
          !hasNextPage && "end"
        }
        {/* {(data?.pages?.length > 0 &&
          emails.map((email) => (
            <div
              key={email.id}
              className={cn(
                "relative flex w-full cursor-pointer items-center justify-between border-t-2 border-t-[#cccccc] p-2 hover:bg-gray-100",
                id.includes(email.id) && "bg-gray-100",
              )}
            >

              <Checkbox id={email.id} className="mr-3 z-20" onClick={() => {
                setId(
                  id.includes(email.id)
                    ? id.filter((id) => id !== email.id)
                    : [...id, email.id],
                );
              }}>
                <CheckboxIndicator />
              </Checkbox>
              <p
                onClick={() => router.push(`/contacts/${email.sender}`)}
                onKeyDown={() => router.push(`/contacts/${email.sender}`)}
              >
                {email.sender}
              </p>
              <p>{email.subject}</p>
              <p>{email.createdAt.toLocaleDateString()}</p>
              {/* The background div for going to the mail page */}
        {/* <div
          className="absolute inset-0"
          onClick={() => {
            router.push(`${team}/email/${email.id}`);
          }}
          onKeyDown={() => {
            router.push(`${team}/email/${email.id}`);
          }}
        />
      </div>
      ))) || (
      <div className="mx-3 flex items-center space-x-2 text-[#666666]">
        <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-400" />
        <p>We are listening on emails for you...</p>
      </div>
          )} */}
      </div>
    </div >
  );
}
