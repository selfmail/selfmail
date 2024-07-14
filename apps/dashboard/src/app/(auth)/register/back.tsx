"use client"

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
    const router = useRouter();
    return (
        <ChevronLeft onClick={() => {
            router.back();
        }} className="h-5 w-5 absolute top-5 left-5 cursor-pointer" />
    )
}