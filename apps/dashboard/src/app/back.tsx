"use client"

import { ChevronLeftIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"

export default function Back() {
    const router = useRouter()
    return (
        <ChevronLeftIcon className="w-4 h-4 text-text-secondary absolute top-8 left-8 cursor-pointer" onClick={() => router.back()} />
    )
}