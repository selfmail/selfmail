"use client";

import { cn } from "@/lib/cn";
import { useMailStore } from "./store";

export default function HeaderInputs() {
  const { updateSubject, updateRecipient, recipient, subject } = useMailStore();

  return (
    <>
      <input
        type="text"
        placeholder="Recipient..."
        onChange={(e) =>
          updateRecipient(
            e.currentTarget.value === "" ? undefined : e.currentTarget.value,
          )
        }
        className={cn("mt-2 border border-b-2 border-t-2 border-b-[#d1d1d1] text-black border-t-[#d1d1d1] bg-transparent p-2 outline-none")}
      />
      <input
        type="text"
        placeholder="Subject..."
        onChange={(e) =>
          updateSubject(
            e.currentTarget.value === "" ? undefined : e.currentTarget.value,
          )
        }
        className={cn(" border border-b-2  border-b-[#d1d1d1] text-black bg-transparent p-2 outline-none")}
      />
    </>
  );
}
