"use client"
import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Donate() {
    const router = useRouter()
    return (
        <div className="flex min-h-screen p-4 items-center flex-col justify-center h-full w-full">
            <ChevronLeftIcon className="w-4 h-4 text-text-secondary absolute top-4 left-4 cursor-pointer" onClick={() => router.back()} />
            <h1 className="text-3xl font-medium">Thank you for your support!</h1>
            <p>This feature is not available yet.</p>
        </div>
    )
}