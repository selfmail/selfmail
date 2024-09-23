"use client";

import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Button, Checkbox, CheckboxIndicator } from "ui";
import { create } from "zustand";

type email = {
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
export const useIds = create<state & action>((set) => ({
  id: [],
  setId: async (state) => {
    set(() => ({ id: state }));
  },
}));

/**
 * The table component, here are all of your mails.
 * You can filter and sort the mails.
 * @param data - an array of mails
 * @returns {JSX.Element}
 */
export default function DataTable({
  data,
  pagniation,
  mailCounter,
}: {
  data: email[];
  pagniation: /* Steps of the pagniation */ {
    first: number;
    last: number;
    difference: number;
  };
  mailCounter: number;
}): JSX.Element {
  const { id, setId } = useIds();
  const emails = useMemo(() => data, [data]);
  const router = useRouter();
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="mx-3 text-3xl font-medium">
            Your Inbox{" "}
            <span className="ml-2 text-[#666666]">{mailCounter}</span>
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
        {(emails.length > 0 &&
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
              <div
                className="absolute inset-0"
                onClick={() => {
                  router.push(`/email/${email.id}`);
                }}
                onKeyDown={() => {
                  router.push(`/email/${email.id}`);
                }}
              />
            </div>
          ))) || (
            <div className="mx-3 flex items-center space-x-2 text-[#666666]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-400" />
              <p>We are listening on emails for you...</p>
            </div>
          )}
      </div>
      {emails.length > 0 && <hr className="border-t-2 border-[#cccccc]" />}
      {
        // row for the pagnation buttons
        <div className="flex items-center space-x-2 p-4">
          <Button
            type="submit"
            disabled={pagniation.first === 0}
            onClick={() =>
              router.push(
                `/?s=${pagniation.first - pagniation.difference}-${pagniation.last - pagniation.difference}`,
              )
            }
          >
            before
          </Button>
          <Button
            type="submit"
            disabled={data.length < pagniation.difference || pagniation.last === mailCounter}
            onClick={() =>
              router.push(
                `/?s=${pagniation.last}-${pagniation.last + pagniation.difference}`,
              )
            }
          >
            next
          </Button>
        </div>
      }
    </div>
  );
}
