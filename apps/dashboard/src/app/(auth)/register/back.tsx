"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <ChevronLeft
      onClick={() => {
        router.back();
      }}
      className="absolute left-5 top-5 h-5 w-5 cursor-pointer"
    />
  );
}
